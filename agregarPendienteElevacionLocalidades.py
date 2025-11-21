import json
import ee

ee.Initialize(project="sirena-477917")

# --- Cargar JSON ---
input_file = "localidades.json"
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# Convertir a FeatureCollection
features = []
for idx, p in enumerate(data):
    point = ee.Feature(
        ee.Geometry.Point([float(p["lon"]), float(p["lat"])]),
        {"id": idx}
    )
    features.append(point)

fc = ee.FeatureCollection(features)

# --- DEMs ---
copernicus = ee.ImageCollection("COPERNICUS/DEM/GLO30").first()
srtm = ee.Image("NASA/NASADEM_HGT/001")

# Calcular pendientes
copernicus_slope = ee.Terrain.slope(copernicus)
srtm_slope = ee.Terrain.slope(srtm)

# Sample con COPERNICUS
sampled1 = copernicus.addBands(copernicus_slope.rename("slope")) \
    .sampleRegions(collection=fc, scale=30, geometries=True)

res1 = sampled1.getInfo()["features"]

# Ver cuáles faltan
missing_ids = []
for feat in res1:
    if feat["properties"]["elevation"] is None:
        missing_ids.append(feat["properties"]["id"])

print(f"Hechos con Copernicus: {527 - len(missing_ids)} / 527 encontrados.")
print(f"{len(missing_ids)} puntos faltan — usando SRTM para esos...")

# Reintentar con SRTM
if missing_ids:
    missing_fc = fc.filter(ee.Filter.inList("id", missing_ids))

    sampled2 = srtm.addBands(srtm_slope.rename("slope")) \
        .sampleRegions(collection=missing_fc, scale=30, geometries=True)

    res2 = sampled2.getInfo()["features"]
else:
    res2 = []

# Mezclar resultados
final = {}
for feat in res2 + res1:
    i = feat["properties"]["id"]
    elev = feat["properties"].get("elevation")
    slope = feat["properties"].get("slope")
    final[i] = (elev, slope)

# Escribir valores en el JSON original
for i, (elev, slope) in final.items():
    data[i]["elevacion"] = elev
    data[i]["pendiente"] = slope

# Guardar resultado
output_file = "localidades.json"
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✔ Listo! Archivo actualizado:", output_file)
