import fs from "fs"

let archivo = "inundaciones.json"

let inundaciones = JSON.parse(fs.readFileSync(archivo))

let lista = [];

for (let i of inundaciones){
    i.distanciaRio = i.rio1.distancia;
    i.codeRio = i.rio1.code;
    delete i["rio1"]
    lista.push(i)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log('✅ ¡Archivo "inundaciones.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}