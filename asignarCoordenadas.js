    import fs from "fs"

let localidades = fs.readFileSync("localidades.json");
let inundaciones = fs.readFileSync("inundaciones.json");

for (let i in inundaciones){
    let codeIn = inundaciones[i]["Code Departamento"]
    for (let w in localidades){
        let codeLoc = localidades[w]["Code Departamento"]
        if (codeIn.length === 4){
            if ("0"+codeIn === codeLoc){
                "seguir"
            }
        }else{
            if (codeIn === codeLoc){
                "seguir con esto"
            }
        }
    }
}