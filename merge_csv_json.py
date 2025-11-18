# merge_csv_json.py
import json
import pandas as pd

INPUT_JSON = "inundaciones.json"
CSV_RESULT = "inundaciones_with_vars.csv"  # archivo que descargaste desde Drive
OUTPUT_JSON = "inundaciones.json"  # vamos a sobrescribir el mismo archivo

# Leer JSON original
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

# Leer CSV exportado por GEE
df = pd.read_csv(CSV_RESULT)

# Verificar que existe idx
if "idx" not in df.columns:
    raise SystemExit("ERROR: el CSV no contiene la columna 'idx'. Asegurate de haber incluido idx en la exportacion.")

# Mapear por idx y actualizar los registros en data
# Convertir idx a int (puede venir como float si quedó NaN)
df["idx"] = df["idx"].astype(int)

# columnas que queremos copiar
cols = ["temperature_2m", "total_evaporation_sum", "runoff_sum", "volumetric_soil_water_layer_1"]

for i, row in df.iterrows():
    idx = int(row["idx"])
    # Protección: si idx está fuera del rango del JSON, lo saltamos
    if idx < 0 or idx >= len(data):
        print(f"Advertencia: idx {idx} fuera de rango; se saltea.")
        continue

    # Asignar (si el valor es NaN lo convertimos a None)
    for c in cols:
        val = row.get(c)
        if pd.isna(val):
            data[idx][c] = None
        else:
            # intentar convertir a float si corresponde
            try:
                # si es entero no lo forzamos necesariamente, dejamos como float si es decimal
                data[idx][c] = float(val)
            except Exception:
                data[idx][c] = val

# Guardar sobre el mismo JSON
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Merge completado. El archivo JSON fue sobrescrito con los 4 nuevos atributos.")
