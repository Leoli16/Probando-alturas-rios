import fs from "fs";

let localidades = JSON.parse(fs.readFileSync("localidades.json"))
let registros = JSON.parse(fs.readFileSync("registrosNegativos.json"))

let listaDeLocalidadesUtilizadas = []
let lista = []

let añoAcortar = 1990
//año 1986


for (let i of registros){
    let año = i["Date (YMD)"].split("/")
    año = parseInt(año[2])
    
    if (año >= añoAcortar){
        lista.push(i)
    }
}



for (let i of lista){
    for (let l of localidades){
        if (l["Code Departamento"] === i["Code Departamento"]){
            if (! listaDeLocalidadesUtilizadas.includes(i["Code Departamento"])){
                listaDeLocalidadesUtilizadas.push(i["Code Departamento"])
            }
        }
    }
}

console.log("Datos utilizados: "+ lista.length)
console.log(`Localidades utilizadas: ${listaDeLocalidadesUtilizadas.length}/${localidades.length}`)