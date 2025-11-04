import fs from "fs";


let rios = JSON.parse(fs.readFileSync("riosNecesariosCon1.json"));

let listaDeRios = []

for (let i of rios){
    let año = i.from_date.substring(0,4);
    año = parseInt(año);
    
    if (año<2015){
        listaDeRios.push(i);
    }
}

console.log(`Disponibles: ${listaDeRios.length}/${rios.length}`);

let contenidoJSON = JSON.stringify(listaDeRios, null, 2);
try {
    fs.writeFileSync('riosAntesDe2015.json', contenidoJSON);
    console.log('✅ ¡Archivo "riosAntesDe2015.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}