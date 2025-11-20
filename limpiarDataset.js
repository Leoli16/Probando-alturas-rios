import fs from "fs"

let archivo = "registrosNegativosDesde2000.json"

let inundaciones = JSON.parse(fs.readFileSync(archivo))

let lista = [];

for (let i of inundaciones){
    if (i.total_evaporation_sum !== null){
      i.total_evaporation_sum = i.total_evaporation_sum * (-1000)
    }   
    lista.push(i)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}