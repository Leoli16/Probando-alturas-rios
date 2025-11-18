# export_gee.py
import json
import ee
import sys
from datetime import datetime

ee.Initialize(project="sirena-477917")

# Nombre del archivo JSON local (entrada)
INPUT_JSON = "registrosNegativosDesde1990.json"

# Nombre que tendrá el CSV en Google Drive (sin ruta)
DRIVE_FILENAME = "registrosNegativosDesde1990.csv"

# Leer JSON
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

# Construir FeatureCollection con propiedad idx para emparejar después
features = []
for idx, d in enumerate(data):
    try:
        lon = float(d["lon"])
        lat = float(d["lat"])
    except Exception as e:
        print(f"Error en coordenadas del idx {idx}: {e}")
        continue

    fecha = d.get("fechas", [])
    if not fecha:
        print(f"Advertencia: registro {idx} no tiene fechas; se saltará.")
        continue
    fecha0 = fecha[0]  # el primer día (ej: "2014-06-23")

    # Crear feature con todas las propiedades originales (para referencia) + idx + fecha
    feat = ee.Feature(ee.Geometry.Point([lon, lat]), d)
    feat = feat.set("idx", idx).set("fecha0", fecha0)
    features.append(feat)

fc = ee.FeatureCollection(features)

# Colección ERA5-Land diaria agregada
era5 = ee.ImageCollection("ECMWF/ERA5_LAND/DAILY_AGGR")

# Función para añadir variables por feature
def add_vars(feat):
    fecha = ee.Date(feat.get("fecha0"))
    img = era5.filterDate(fecha, fecha.advance(1, "day")).first()

    # Si no hay imagen ese día, evitamos fallar devolviendo nulls
    vars = ee.Dictionary(ee.Algorithms.If(
        img,
        img.reduceRegion(
            reducer=ee.Reducer.first(),
            geometry=feat.geometry(),
            scale=1000  # podes bajar a 100 si querés mas resolución (y más costo)
        ),
        ee.Dictionary({
            "temperature_2m": None,
            "total_evaporation_sum": None,
            "runoff_sum": None,
            "volumetric_soil_water_layer_1": None
        })
    ))

    # setea las 4 variables (usá las claves tal cual)
    return feat.set({
        "temperature_2m": vars.get("temperature_2m"),
        "total_evaporation_sum": vars.get("total_evaporation_sum"),
        "runoff_sum": vars.get("runoff_sum"),
        "volumetric_soil_water_layer_1": vars.get("volumetric_soil_water_layer_1")
    })

# Mapear sobre toda la colección
result = fc.map(add_vars)

# Lanzar exportación a Google Drive
task = ee.batch.Export.table.toDrive(
    collection=result,
    description="Export_registrosNegativosDesde1990",
    fileNamePrefix=DRIVE_FILENAME.replace(".csv", ""),
    fileFormat="CSV"
)

task.start()
print("Tarea de exportación iniciada. Revisa la pestaña TASKS en https://earthengine.google.com/ (o en la consola).")
print("Drive file name prefix:", DRIVE_FILENAME)
