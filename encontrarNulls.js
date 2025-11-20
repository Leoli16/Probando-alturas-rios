import fs from "fs"

let archivo = JSON.parse(fs.readFileSync("inundacionesDesde1990.json"))


let contador = 0;
for (let i of archivo){
    if (i.temperature_2m === null || i.precipitation_sum[0] === null ){
        contador+=1;
    }
}

console.log(`No Nulos: ${archivo.length - contador}`)