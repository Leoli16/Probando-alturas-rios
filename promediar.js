import fs from "fs"

let localidades = JSON.parse(fs.readFileSync("cantidadDeRegistrosPorLocalidad.json"))
let contador  = 0;
let sumador = 0
for (let i in localidades){
    if (localidades[i] < 10){
        console.log(localidades[i], i)
        contador+=1
    }
    sumador+=1
}

console.log(contador/sumador *100)
console.log(sumador)