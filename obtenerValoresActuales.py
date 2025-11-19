# get_yesterday_vars.py
import requests
import math
from datetime import datetime, timezone, timedelta

# Optional: Earth Engine usage (set use_ee=True to try SMAP/ERA5/GFS improvements)
try:
    import ee
    EE_AVAILABLE = True
except Exception:
    EE_AVAILABLE = False

# ---------- Helpers ----------
def clamp(x, lo, hi):
    if x is None:
        return None
    return max(lo, min(hi, x))

def fetch_open_meteo_daily(lat, lon, date_iso, timeout=15):
    """
    Returns dict with keys: precip_mm, tmin_C, tmax_C, tmean_C (may be None).
    Uses America/Argentina/Buenos_Aires timezone so day boundaries match local day.
    """
    url = ("https://archive-api.open-meteo.com/v1/archive?"
           f"latitude={lat}&longitude={lon}&start_date={date_iso}&end_date={date_iso}"
           "&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
           "&timezone=America/Argentina/Buenos_Aires")
    try:
        r = requests.get(url, timeout=timeout)
        r.raise_for_status()
        j = r.json()
        daily = j.get("daily", {})
        precip = None
        tmax = None
        tmin = None
        tmean = None
        if 'precipitation_sum' in daily:
            vals = daily['precipitation_sum']
            if isinstance(vals, list) and len(vals) > 0:
                precip = float(vals[0])
        if 'temperature_2m_max' in daily and 'temperature_2m_min' in daily:
            vmax = daily['temperature_2m_max']
            vmin = daily['temperature_2m_min']
            if isinstance(vmax, list) and isinstance(vmin, list) and len(vmax)>0 and len(vmin)>0:
                tmax = float(vmax[0])
                tmin = float(vmin[0])
                tmean = (tmax + tmin) / 2.0
        return {"precip_mm": precip, "tmin_C": tmin, "tmax_C": tmax, "tmean_C": tmean}
    except Exception:
        return {"precip_mm": None, "tmin_C": None, "tmax_C": None, "tmean_C": None}

def fetch_open_meteo_hourly_minmax(lat, lon, date_iso, timeout=15):
    """Fallback: hourly temps -> return (tmin, tmax) or (None,None)"""
    url = ("https://archive-api.open-meteo.com/v1/archive?"
           f"latitude={lat}&longitude={lon}&start_date={date_iso}&end_date={date_iso}"
           "&hourly=temperature_2m&timezone=America/Argentina/Buenos_Aires")
    try:
        r = requests.get(url, timeout=timeout)
        r.raise_for_status()
        j = r.json()
        temps = j.get("hourly", {}).get("temperature_2m", [])
        if temps:
            return (float(min(temps)), float(max(temps)))
    except Exception:
        pass
    return (None, None)

# Hargreaves ET0 (mm/day)
def hargreaves_et(Tmin_C, Tmax_C, lat_deg, doy):
    if Tmin_C is None or Tmax_C is None:
        return None
    Tavg = (Tmin_C + Tmax_C) / 2.0
    # simple RA approximation
    phi = math.radians(lat_deg)
    dr = 1 + 0.033 * math.cos(2 * math.pi * doy / 365.0)
    delta = 0.409 * math.sin(2 * math.pi * doy / 365.0 - 1.39)
    ws = math.acos(-math.tan(phi) * math.tan(delta))
    Gsc = 0.0820
    Ra = (24*60/math.pi) * Gsc * dr * (ws * math.sin(phi) * math.sin(delta) + math.cos(phi) * math.cos(delta) * math.sin(ws))
    # Hargreaves formula
    diff = max(0.0, Tmax_C - Tmin_C)
    ET0 = 0.0023 * (Tavg + 17.8) * math.sqrt(diff) * Ra
    return max(0.0, ET0)

# SCS-CN runoff (mm)
def scs_runoff(P_mm, CN):
    if P_mm is None:
        return None
    if P_mm <= 0:
        return 0.0
    S = (25400.0 / CN) - 254.0
    Ia = 0.2 * S
    if P_mm <= Ia:
        return 0.0
    Q = ((P_mm - Ia)**2) / (P_mm + 0.8 * S)
    return max(0.0, Q)

# soil bucket estimator
def estimate_soil_moisture(prev_sm, P_mm, ET_mm):
    if prev_sm is None:
        prev_sm = 0.25
    root_depth = 0.3  # m
    delta_m = ( (P_mm if P_mm is not None else 0.0) - (ET_mm if ET_mm is not None else 0.0) ) / 1000.0
    sm_new = prev_sm + (delta_m / root_depth)
    return max(0.03, min(0.5, sm_new))

# ---------- Main function ----------
def get_yesterday_vars(lat, lon, date=None, cn=75, prev_sm=None, use_ee=True):
    """
    Returns dict with:
      - temperature_2m (C)
      - total_evaporation_sum (mm)
      - runoff_sum (mm)
      - volumetric_soil_water_layer_1 (m3/m3)
      - source (metadata dict)
    Behavior:
      - Open-Meteo is used as PRIMARY source for temperature & precipitation.
      - If use_ee and ee available, then SMAP/ERA5/GFS are attempted to improve values.
      - If any variable is missing, fallbacks compute estimates (Hargreaves, SCS-CN, bucket).
    """
    # determine target date (yesterday in America/Argentina/Buenos_Aires)
    if date is None:
        now_utc = datetime.now(timezone.utc)
        now_ar = now_utc - timedelta(hours=3)  # Argentina UTC-3 (no DST assumed)
        target_date = (now_ar.date() - timedelta(days=1)).isoformat()
    else:
        target_date = date

    out = {
        "date": target_date,
        "lat": lat,
        "lon": lon,
        "temperature_2m": None,
        "total_evaporation_sum": None,
        "runoff_sum": None,
        "volumetric_soil_water_layer_1": None,
        "source": {}
    }

    # 1) PRIMARY: Open-Meteo daily (precip + Tmin/Tmax -> mean)
    om = fetch_open_meteo_daily(lat, lon, target_date)
    precip_mm = om.get("precip_mm")
    tmin = om.get("tmin_C")
    tmax = om.get("tmax_C")
    tmean = om.get("tmean_C")

    # Validate Open-Meteo outputs and clamp
    if tmean is not None:
        tmean = clamp(tmean, -60.0, 60.0)
    if tmin is not None:
        tmin = clamp(tmin, -80.0, 60.0)
    if tmax is not None:
        tmax = clamp(tmax, -80.0, 80.0)
    if precip_mm is not None:
        precip_mm = max(0.0, float(precip_mm))

    if tmean is not None:
        out["temperature_2m"] = float(tmean)
        out["source"]["temperature_2m"] = "Open-Meteo daily (tmax/tmin mean)"
    elif tmin is not None and tmax is not None:
        out["temperature_2m"] = float((tmin + tmax)/2.0)
        out["source"]["temperature_2m"] = "Open-Meteo daily (computed mean)"

    if precip_mm is not None:
        out["source"]["precipitation"] = "Open-Meteo daily"
    else:
        out["source"]["precipitation"] = "Open-Meteo missing"

    # 2) Attempt to improve with EE if requested and available
    smap_val = None
    evap_mm = None
    runoff_mm = None
    gfs_temp_mean = None
    if use_ee and EE_AVAILABLE:
        try:
            # assume ee.Initialize() already called by user; do not call ee.Authenticate() here
            pt = ee.Geometry.Point([lon, lat])
            # 2A) SMAP search ±3 days
            for d in range(-3, 4):
                day = ee.Date(target_date).advance(d, "day")
                coll = ee.ImageCollection("NASA/SMAP/SPL3SMP_E/006").filterDate(day, day.advance(1,'day')).filterBounds(pt)
                if coll.size().getInfo() == 0:
                    continue
                img = coll.first()
                bands = img.bandNames().getInfo()
                candidate = next((c for c in ["soil_moisture_am","soil_moisture_pm","soil_moisture"] if c in bands), None)
                if candidate:
                    val = img.select(candidate).reduceRegion(ee.Reducer.mean(), pt, 9000).get(candidate)
                    if val is not None:
                        smap_val = float(val.getInfo())
                        out["volumetric_soil_water_layer_1"] = smap_val
                        out["source"]["volumetric_soil_water_layer_1"] = f"SMAP ({candidate}) date_offset={d}"
                        break
            # 2B) ERA5_LAND HOURLY for evap & runoff (sum over day)
            era5 = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY").filterDate(ee.Date(target_date), ee.Date(target_date).advance(1,'day')).filterBounds(pt)
            if era5.size().getInfo() > 0:
                first = era5.first()
                bands = first.bandNames().getInfo()
                # pick evap candidate
                evap_cands = ["total_evaporation","evaporation","evabs"]
                evap_band = next((c for c in evap_cands if c in bands), None)
                if evap_band:
                    evap_img = era5.select(evap_band).sum()
                    val = evap_img.reduceRegion(ee.Reducer.mean(), pt, 10000).get(evap_band)
                    if val is not None:
                        evap_mm = float(val.getInfo()) * 1000.0
                        out["total_evaporation_sum"] = evap_mm
                        out["source"]["total_evaporation_sum"] = f"ERA5_LAND hourly ({evap_band})"
                # runoff: surface + subsurface
                run_surface = next((c for c in ["surface_runoff","runoff","ro"] if c in bands), None)
                run_sub = next((c for c in ["sub_surface_runoff","subsurface_runoff"] if c in bands), None)
                if run_surface:
                    run_img = era5.select(run_surface).sum()
                    if run_sub:
                        run_img = run_img.add(era5.select(run_sub).sum())
                    rr = run_img.reduceRegion(ee.Reducer.mean(), pt, 10000).get(run_surface)
                    if rr is not None:
                        runoff_mm = float(rr.getInfo()) * 1000.0
                        out["runoff_sum"] = runoff_mm
                        out["source"]["runoff_sum"] = f"ERA5_LAND hourly ({run_surface}{' + '+run_sub if run_sub else ''})"
                # 2C) GFS (as improvement for temperature if Open-Meteo failed)
                gfs = ee.ImageCollection("NOAA/GFS0P25").filterDate(ee.Date(target_date), ee.Date(target_date).advance(1,'day')).filterBounds(pt)
                if gfs.size().getInfo() > 0:
                    gfs_band = "temperature_2m_above_ground"
                    tmp_img = gfs.select(gfs_band).mean()
                    tmp_val = tmp_img.reduceRegion(ee.Reducer.mean(), pt, 10000).get(gfs_band)
                    if tmp_val is not None:
                        gfs_temp_mean = float(tmp_val.getInfo()) - 273.15
                        # accept GFS temp only if Open-Meteo missing or absurd
                        if out["temperature_2m"] is None or not (-60 < out["temperature_2m"] < 60):
                            out["temperature_2m"] = clamp(gfs_temp_mean, -60.0, 60.0)
                            out["source"]["temperature_2m"] = "GFS (NOAA/GFS0P25)"
        except Exception:
            # if any EE call fails, we silently skip EE improvements and rely on Open-Meteo + fallbacks
            pass

    # 3) If Open-Meteo missing temperature or out of range, try hourly fallback, then Hargreaves
    if out["temperature_2m"] is None or not (-60.0 < out["temperature_2m"] < 60.0):
        tmin,tmax = fetch_open_meteo_hourly_minmax(lat, lon, target_date)
        if tmin is not None and tmax is not None:
            out["temperature_2m"] = (tmin + tmax)/2.0
            out["source"]["temperature_2m"] = "Open-Meteo hourly fallback"
        elif gfs_temp_mean is not None:
            out["temperature_2m"] = clamp(gfs_temp_mean, -60.0, 60.0)
            out["source"]["temperature_2m"] = "GFS fallback"

    # 4) Precip: use Open-Meteo primary; if still missing and EE available, try IMERG via GEE (best-effort)
    if precip_mm is None and use_ee and EE_AVAILABLE:
        try:
            pt = ee.Geometry.Point([lon, lat])
            imerg = ee.ImageCollection("NASA/GPM_L3/IMERG_V07").filterDate(ee.Date(target_date), ee.Date(target_date).advance(1,'day')).filterBounds(pt)
            if imerg.size().getInfo() > 0:
                img = imerg.select("precipitation").sum()
                val = img.reduceRegion(ee.Reducer.mean(), pt, 10000).get("precipitation")
                if val is not None:
                    precip_mm = float(val.getInfo())
                    out["source"]["precipitation"] = "IMERG via GEE"
        except Exception:
            pass

    # 5) Evap fallback: if we don't have evap_mm from ERA5, compute with Hargreaves (needs Tmin/Tmax)
    if out["total_evaporation_sum"] is None:
        # ensure Tmin/Tmax available
        if tmin is None or tmax is None:
            tmin, tmax = fetch_open_meteo_hourly_minmax(lat, lon, target_date)
        if tmin is not None and tmax is not None:
            doy = datetime.fromisoformat(target_date).timetuple().tm_yday
            evap_calc = hargreaves_et(tmin, tmax, lat, doy)
            if evap_calc is not None:
                out["total_evaporation_sum"] = float(evap_calc)
                out["source"]["total_evaporation_sum"] = "Hargreaves fallback (from Open-Meteo/GFS temps)"
        else:
            # as last resort, set None (avoid zeroes that mislead)
            out["total_evaporation_sum"] = None

    # 6) Runoff fallback: SCS-CN using precip_mm (Open-Meteo primary). If precip missing -> None
    if out["runoff_sum"] is None:
        try:
            CN = cn if cn is not None else 75
            if precip_mm is None:
                # attempt final fetch from Open-Meteo just in case
                precip_mm = fetch_open_meteo_daily(lat, lon, target_date).get("precip_mm")
            if precip_mm is not None:
                q = scs_runoff(precip_mm, CN)
                out["runoff_sum"] = float(q)
                out["source"]["runoff_sum"] = f"SCS-CN fallback (CN={CN})"
            else:
                out["runoff_sum"] = None
        except Exception:
            out["runoff_sum"] = None

    # 7) Soil moisture fallback: if SMAP missing, estimate bucket with prev_sm and ET/precip
    if out["volumetric_soil_water_layer_1"] is None:
        et_use = out.get("total_evaporation_sum")
        p_use = precip_mm
        sm_est = estimate_soil_moisture(prev_sm if prev_sm is not None else 0.25, p_use if p_use is not None else 0.0, et_use if et_use is not None else 2.0)
        out["volumetric_soil_water_layer_1"] = float(sm_est)
        out["source"]["volumetric_soil_water_layer_1"] = "Estimated bucket fallback"

    # final cleanup: avoid impossible numbers, ensure types
    # temp range sanity
    if out["temperature_2m"] is not None:
        if not (-60.0 <= out["temperature_2m"] <= 60.0):
            out["temperature_2m"] = None

    # evap/runoff ensure non-negative
    if out["total_evaporation_sum"] is not None:
        out["total_evaporation_sum"] = max(0.0, float(out["total_evaporation_sum"]))
    if out["runoff_sum"] is not None:
        out["runoff_sum"] = max(0.0, float(out["runoff_sum"]))

    return out

# -------------- Example usage --------------
# Before calling, if you want EE improvements run:
# import ee; ee.Authenticate(); ee.Initialize()
# Then:
print(get_yesterday_vars(-27.47, -55.92, use_ee=True))
