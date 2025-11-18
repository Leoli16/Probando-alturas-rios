import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("inundacionesDesde2000.json"))

let lista = inundaciones
const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde2000.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde2000.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}