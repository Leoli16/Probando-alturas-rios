import fs from "fs"

let registros = JSON.parse(fs.readFileSync("registrosNegativos.json"))
let localidades = JSON.parse(fs.readFileSync("localidades.json"))

let lista = [];

for (let i of registros){
    for (let l of localidades){
        if (i["Code Departamento"] === l["Code Departamento"]){
            i.tipoDeSuelo = l.tipoDeSuelo;
        }
    }

    lista.push(i)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativos.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}