import fs from "fs"


let localidades = fs.readFileSync("localidades.json");
localidades = JSON.parse(localidades)
let inundaciones = fs.readFileSync("inundaciones.json");
inundaciones = JSON.parse(inundaciones)

for (let i in inundaciones){
    let codeIn = inundaciones[i]["Code Departamento"]
    for (let w in localidades){
        let codeLoc = localidades[w]["Code Departamento"]
        if (codeIn.length === 4){
            if ("0"+codeIn === codeLoc){
                inundaciones[i].lat = localidades[w].lat
                inundaciones[i].lon = localidades[w].lon
            }
            else if (codeIn === "6378"){
                inundaciones[i].lat = "-34.4627196"
                inundaciones[i].lon = "-58.7739423"
            }
        }else{
            if (codeIn === codeLoc){
                inundaciones[i].lat = localidades[w].lat
                inundaciones[i].lon = localidades[w].lon
            }
        }
    }
}

let lista = inundaciones
const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('inundaciones.json', contenidoJSON);
    console.log('✅ ¡Archivo "inundaciones.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}