import fs from "fs"

let registros = JSON.parse(fs.readFileSync("inundaciones.json"))

let lista = []

for (let i of registros){
    if (i["Code Departamento"].length === 4){
        i["Code Departamento"] = "0"+i["Code Departamento"]
    }
    lista.push(i)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('inundaciones.json', contenidoJSON);
    console.log('✅ ¡Archivo "inundaciones.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}