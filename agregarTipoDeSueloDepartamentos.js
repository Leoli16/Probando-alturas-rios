import fs from "fs"

let tiposDeSuelos = JSON.parse(fs.readFileSync("tiposDeSuelos.json"))
let localidades = JSON.parse(fs.readFileSync("localidades.json"))

let lista = []

for (let i of localidades){
    let noEncontrado = true
    for (let t of tiposDeSuelos){
        if (i["Code Departamento"] === t.in1){
            i.tipoDeSuelo = t.ORDEN_SUE1;
            noEncontrado = false
        }
    }
    if (noEncontrado){i.tipoDeSuelo = "no tiene";}
    lista.push(i);
}


const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('localidades.json', contenidoJSON);
    console.log('✅ ¡Archivo "localidades.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}