import fs from "fs"

let archivo = "inundacionesDesde1990.json"
let registros = JSON.parse(fs.readFileSync(archivo))
let localidades = JSON.parse(fs.readFileSync("localidades.json"))


let lista = []
for (let i of registros){
    for (let l of localidades){
        if (i["Code Departamento"] === l["Code Departamento"]){
            i.elevacion_m = l.elevacion_m;
            i.pendiente_grados = l.pendiente_grados;
            lista.push(i)
        }
    }
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log(`✅ ¡Archivo ${archivo} guardado con éxito!`);
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}