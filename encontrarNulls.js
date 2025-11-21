import fs from "fs"

let archivo = JSON.parse(fs.readFileSync("datasetRealDesde1990.json"))

let lista = []
let contador = 0;
for (let i of archivo){
    if (i.temperature_2m === null || i.precipitation_sum[0] === null ){
        contador+=1;
    }
    else{
        lista.push(i)
    }
}

console.log(`No Nulos: ${archivo.length - contador}/${archivo.length}`)



let localidades = JSON.parse(fs.readFileSync("localidades.json"))

let listaDeLocalidadesUtilizadas = []
let listaDeNoUsadas = []

for (let i of localidades){
    let found = false
    for (let l of lista){
        if (l["Code Departamento"] === i["Code Departamento"]){
            if (! listaDeLocalidadesUtilizadas.includes(i["Code Departamento"])){
                listaDeLocalidadesUtilizadas.push(i["Code Departamento"])
            }
            found = true
            break
        }
    }
    if (! found){
        console.log("no encontrado "+ i["Code Departamento"])
        if ( !listaDeNoUsadas.includes(i["Code Departamento"])){
            listaDeNoUsadas.push(i["Code Departamento"])
        }
    }
}

console.log("Datos utilizados: "+ lista.length)
console.log(`Localidades utilizadas: ${listaDeLocalidadesUtilizadas.length}/${localidades.length}`)

console.log(`Las ${listaDeNoUsadas.length} localidades no usadas son: ${listaDeNoUsadas}`)