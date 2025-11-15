import fs from "fs";



function contar(archivo){
    let content = fs.readFileSync(archivo,"utf-8");
    content = JSON.parse(content);
    //console.log(content);
    console.log(content.length);
}

contar("localidades.json");