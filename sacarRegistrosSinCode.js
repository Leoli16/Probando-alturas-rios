import fs from "fs"


let archivo = "inundacionesConDatos.json"
let registros = JSON.parse(fs.readFileSync(archivo))
let lista = []

for (let i of registros){
    if (i["Code Departamento"] !== ""){
        lista.push(i);
    }
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log(`✅ ¡Archivo "${archivo}" guardado con éxito!`);
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}