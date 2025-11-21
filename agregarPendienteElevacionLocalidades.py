import ee
import json
import os
import time

# Inicializar (en Colab puede pedirse autenticación)
try:
    ee.Initialize(project="sirena-477917")
except Exception as e:
    print("No inicializado: ejecuta 'earthengine authenticate' o usa ee.Authenticate() en Colab.")
    raise

INPUT_JSON = "localidades.json"   # tu archivo de entrada
OUTPUT_JSON = "localidades.json"  # archivo de salida

# --- Leer JSON local ---
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Registros leídos: {len(data)}")

# --- Crear FeatureCollection de puntos con una propiedad idx para emparejar luego ---
features = []
for i, item in enumerate(data):
    lat = float(item["lat"])
    lon = float(item["lon"])
    props = dict(item)  # copia de propiedades
    props["orig_index"] = i
    feat = ee.Feature(ee.Geometry.Point([lon, lat]), props)
    features.append(feat)

fc = ee.FeatureCollection(features)

# --- Preparar imágenes: elevation (float) y slope ---
srtm = ee.Image("USGS/SRTMGL1_003").toFloat()             # convertir a float para preservar decimales
slope = ee.Terrain.slope(srtm).rename("slope")            # pendiente en grados (float)
elev = srtm.rename("elevation")
combined = elev.addBands(slope)                           # imagen con 2 bandas

# --- Muestrear todos los puntos en una sola llamada ---
start = time.time()
sampled = combined.sampleRegions(collection=fc, scale=30, geometries=True)
# Traer los resultados al cliente (es una sola llamada para ~527 puntos; rápido)
result = sampled.getInfo()
elapsed = time.time() - start
print(f"Sampling completado en {elapsed:.1f} s. Features retornadas: {len(result.get('features', []))}")

# --- Mapear resultados de vuelta al array original y guardar ---
for f in result.get("features", []):
    props = f.get("properties", {})
    idx = int(props.get("orig_index", -1))
    if idx >= 0:
        elev_val = props.get("elevation", None)
        slope_val = props.get("slope", None)
        # limpiar y redondear (si no es None)
        if elev_val is not None:
            try:
                elev_val = round(float(elev_val), 2)
            except:
                elev_val = None
        if slope_val is not None:
            try:
                slope_val = round(float(slope_val), 2)
            except:
                slope_val = None

        data[idx]["elevacion_m"] = elev_val
        data[idx]["pendiente_grados"] = slope_val
    else:
        print("Warning: feature sin orig_index:", props.get("Nombre", "sin nombre"))

# --- Guardar JSON de salida ---
out_path = os.path.abspath(OUTPUT_JSON)
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"✅ Guardado: {out_path}")
