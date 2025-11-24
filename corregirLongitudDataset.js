import fs from "fs"

let datasetNegativos = JSON.parse(fs.readFileSync("registrosNegativosDesde1990_doble.json"))
let datasetPositivos = JSON.parse(fs.readFileSync("inundacionesDesde1990.json"))

let lista = []

for (let i of datasetNegativos){
    if (lista.length < datasetPositivos.length){
        lista.push(i)
    }
}


const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde1990_doble.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde1990_doble.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}