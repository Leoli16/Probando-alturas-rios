import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("inundaciones.json"))

let añoACortar = 1990

let lista = []

for (let i of inundaciones){
    let año = parseInt(i["Date (YMD)"].split("/")[2])

    if (año >= añoACortar){
        lista.push(i)
    }
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(`inundacionesDesde${añoACortar}.json`, contenidoJSON);
    console.log(`✅ ¡Archivo "inundacionesDesde${añoACortar}.json" guardado con éxito!`);
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}