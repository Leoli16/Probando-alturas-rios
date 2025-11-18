import fs from "fs"

let registros = JSON.parse(fs.readFileSync("registrosNegativosDesde1990.json"))
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
    fs.writeFileSync('registrosNegativosDesde1990.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde1990.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}