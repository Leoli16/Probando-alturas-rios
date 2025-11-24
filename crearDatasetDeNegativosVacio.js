import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("inundacionesDesde1990.json"))

let lista = inundaciones
const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde1990_doble.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde1990_doble.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}