import fs from "fs"

let archivo = "registrosNegativosDesde1990.json"

let inundaciones = JSON.parse(fs.readFileSync(archivo))

let lista = [];

for (let i of inundaciones){
    if (i.temperature_2m !== null){
      i.temperature_2m = i.temperature_2m - 273.15
    }   
    lista.push(i)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log(`✅ ¡Archivo "${archivo}" guardado con éxito!`);
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}