import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("inundaciones.json"))

let lista = inundaciones
const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativos.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}