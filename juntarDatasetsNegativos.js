import fs from "fs"

let archivo1 = JSON.parse(fs.readFileSync("registrosNegativosDesde1990.json"))
let archivo2 = JSON.parse(fs.readFileSync("registrosNegativosDesde1990_doble.json"))

let lista = archivo1.concat(archivo2)

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde1990_combinado.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde1990_combinado.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}