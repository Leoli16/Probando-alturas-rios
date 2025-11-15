import fs from "fs"

let datasetNegativos = JSON.parse(fs.readFileSync("registrosNegativos.json"));
let datasetPositivos = JSON.parse(fs.readFileSync("inundaciones.json"));
let localidades = JSON.parse(fs.readFileSync("localidades.json"))

function generarNumeroRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let lista = []

for (let i of datasetNegativos){

    let nuevoCode = localidades[generarNumeroRandom(0,529)]["Code Departamento"];
    while (nuevoCode === i["Code Departamento"]){
        nuevoCode = localidades[generarNumeroRandom(0,529)]["Code Departamento"];
    }

    let fechasNuevas = [];

    for (let j of datasetPositivos){
        if (j["Code Departamento"] === nuevoCode){
            fechasNuevas = fechasNuevas.concat(j.fechas)
        }
    }

    let fechasOG = i.fechas;
    let repetido = false;
    for (let f of fechasOG){
        if (fechasNuevas.includes(f)){
            repetido = true
        }
    }

    while (repetido){
        nuevoCode = localidades[generarNumeroRandom(0,529)]["Code Departamento"];
        while (nuevoCode === i["Code Departamento"]){
            nuevoCode = localidades[generarNumeroRandom(0,529)]["Code Departamento"];
        }

        fechasNuevas = [];

        for (let j of datasetPositivos){
            if (j["Code Departamento"] === nuevoCode){
                fechasNuevas = fechasNuevas.concat(j.fechas)
            }
        }

        fechasOG = i.fechas;
        repetido = false;
        for (let f of fechasOG){
            if (fechasNuevas.includes(f)){
                repetido = true
            }
        }
    }

    i["Code Departamento"] = nuevoCode;

    delete i.lat
    delete i.lon
    delete i.hayRioCercano
    delete i.distanciaRio
    delete i.codeRio
    i.Provincia = "hay que cambiarlo"
    i["Code Provincia"] = "hay que cambiarlo"
    i.Departamento = "hay que cambiarlo";

    lista.push(i)
}

let listaDeLocalidadesUtilizadas = []


for (let i of lista){
    for (let l of localidades){
        if (l["Code Departamento"] === i["Code Departamento"]){
            if (! listaDeLocalidadesUtilizadas.includes(i["Code Departamento"])){
                listaDeLocalidadesUtilizadas.push(i["Code Departamento"])
            }
        }
    }
}

console.log("");
console.log(`Localidades usadas en el dataset negativo: ${listaDeLocalidadesUtilizadas.length}/${localidades.length}`);

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativos.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}