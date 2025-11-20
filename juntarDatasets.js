import fs from "fs"

let registrosPostitivos = JSON.parse(fs.readFileSync("inundacionesDesde1990.json"))
let registrosNegativos = JSON.parse(fs.readFileSync("registrosNegativosDesde1990.json"))

let lista = []

for (let i of registrosPostitivos){
    let registro = {};
    registro["Code Departamento"] = i["Code Departamento"];
    registro.hayRioCercano = i.hayRioCercano;
    registro.distanciaRio = i.distanciaRio;
    registro.tipoDeSuelo = i.tipoDeSuelo;
    registro.estacion = i.estacion;
    registro.temperature_2m = i.temperature_2m;
    registro.total_evaporation_sum = i.total_evaporation_sum;
    //registro.runoff_sum = i.runoff_sum;
    registro.volumetric_soil_water_layer_1 = i.volumetric_soil_water_layer_1;
    registro.precipitation_sum = i.precipitation_sum
    registro.seInunda = 1;

    lista.push(registro);
}

for (let i of registrosNegativos){
    let registro = {};
    registro["Code Departamento"] = i["Code Departamento"];
    registro.hayRioCercano = i.hayRioCercano;
    registro.distanciaRio = i.distanciaRio;
    registro.tipoDeSuelo = i.tipoDeSuelo;
    registro.estacion = i.estacion;
    registro.temperature_2m = i.temperature_2m;
    registro.total_evaporation_sum = i.total_evaporation_sum;
    //registro.runoff_sum = i.runoff_sum;
    registro.volumetric_soil_water_layer_1 = i.volumetric_soil_water_layer_1;
    registro.precipitation_sum = i.precipitation_sum
    registro.seInunda = 0;

    lista.push(registro);
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('datasetRealDesde1990.json', contenidoJSON);
    console.log('✅ ¡Archivo "datasetRealDesde1990.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}