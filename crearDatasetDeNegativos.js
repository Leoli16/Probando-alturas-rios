import fs from "fs"

let datasetNegativos = JSON.parse(fs.readFileSync("registrosNegativosDesde2000.json"));
let datasetPositivos = JSON.parse(fs.readFileSync("inundacionesDesde2000.json"));
let localidades = JSON.parse(fs.readFileSync("localidades.json"))

function generarNumeroRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function proceso(){
    let lista = []
    let listaDeCodes = []
    for (let i of datasetNegativos){
    
        let nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
        while (nuevoCode === i["Code Departamento"]){
            nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
        }
        if (listaDeCodes.length < localidades.length){
            while (listaDeCodes.includes(nuevoCode)){
                nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
            }
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
            nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
            while (nuevoCode === i["Code Departamento"]){
                nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
            }
            if (listaDeCodes.length < localidades.length){
                while (listaDeCodes.includes(nuevoCode)){
                    nuevoCode = localidades[generarNumeroRandom(0,526)]["Code Departamento"];
                }
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
        listaDeCodes.push(nuevoCode)
        lista.push(i)
    }
    return lista
}


let lista = proceso()


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

while (listaDeLocalidadesUtilizadas.length !== localidades.length){
    console.log(`No se pudo, voy de vuelta: ${listaDeLocalidadesUtilizadas.length}/${localidades.length}`)
    lista = proceso()


    listaDeLocalidadesUtilizadas = []

    for (let i of lista){
        for (let l of localidades){
            if (l["Code Departamento"] === i["Code Departamento"]){
                if (! listaDeLocalidadesUtilizadas.includes(i["Code Departamento"])){
                    listaDeLocalidadesUtilizadas.push(i["Code Departamento"])
                }
            }
        }
    }
}

console.log("");
console.log(`Localidades usadas en el dataset negativo: ${listaDeLocalidadesUtilizadas.length}/${localidades.length}`);

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde2000.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde2000.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}