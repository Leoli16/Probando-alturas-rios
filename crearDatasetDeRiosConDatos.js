import fs from "fs"

let riosTotales = JSON.parse(fs.readFileSync("alturasHidrometricas.json"));
let riosConDatos = JSON.parse(fs.readFileSync("listaDeRiosConDatos.json"));

let listaFinal = [];

for (let i of riosTotales){
    let code = `${i.seriesid}-${i.sitecode}`
    for (let r of riosConDatos){
        if (r === code){
            listaFinal.push(i)
        }
    }
}

const contenidoJSON = JSON.stringify(listaFinal, null, 2);

try {
    fs.writeFileSync('alturasHidrometricasConDatos.json', contenidoJSON);
    console.log('✅ ¡Archivo "alturasHidrometricasConDatos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}