import fs from "fs"

let departamentosDelFront = JSON.parse(fs.readFileSync("departamentosDelFront.json"));
let localidades = JSON.parse(fs.readFileSync("localidades.json"));

let lista = []

for (let i of localidades){
    for (let d of departamentosDelFront){
        if (d.IN1 === i["Code Departamento"] && d.NAM.includes(i.Nombre)){
            console.log(`${i.Nombre}   -   ${d.NAM}`)
            if (! lista.includes(i["Code Departamento"])){
                lista.push(i["Code Departamento"])
            }
        }
    }
}


console.log(`Encontrados: ${lista.length}/${localidades.length}`)


// const contenidoJSON = JSON.stringify(lista, null, 2);

// try {
//     fs.writeFileSync('departamentosDelFront.json', contenidoJSON);
//     console.log('✅ ¡Archivo "departamentosDelFront.json" guardado con éxito!');
//   } catch (error) {
//     console.error('❌ Error al guardar el archivo:', error);
// }