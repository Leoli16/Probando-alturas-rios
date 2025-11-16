import fs from "fs"

let registros = JSON.parse(fs.readFileSync("inundaciones.json"))


let codesList = []
for (let i of registros){
    if (! Object.hasOwn(i, 'tipoDeSuelo')){
        codesList.push(i["Code Departamento"])
    }
}

console.log(codesList)