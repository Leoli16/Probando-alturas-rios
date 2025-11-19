import ee
ee.Authenticate()
ee.Initialize(project="sirena-477917")

# Punto de muestra (lon, lat)
pt = ee.Geometry.Point([-55.92, -27.47])

# Fechas recientes (ayer)
start_date = '2025-11-12'
end_date = '2025-11-19'

# ERA5-Land Hourly → convertir a Daily agregando
era5 = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY") \
    .filterBounds(pt) \
    .filterDate(start_date, end_date)

# Qué variables y cómo agregarlas
sum_vars = ['total_evaporation', 'runoff']
mean_vars = ['temperature_2m', 'volumetric_soil_water_layer_1']

daily_sum = era5.select(sum_vars).sum()
daily_mean = era5.select(mean_vars).mean()

# Combinar todo en una sola imagen
daily = daily_sum.addBands(daily_mean)

# Extraer valores en el punto
result = daily.reduceRegion(
    reducer=ee.Reducer.mean(),
    geometry=pt,
    scale=10000
)

print(result.getInfo())
