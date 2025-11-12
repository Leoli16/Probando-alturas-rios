import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("inundaciones.json"));

let contador = 0;
for (let i in inundaciones){
    if (inundaciones[i].rio1.distancia <= 15){
        contador+=1;
        inundaciones[i].hayRioCercano = true;
    }
    else{
        inundaciones[i].hayRioCercano = false;
    }
}
console.log(`Cercanos a ríos hay: ${contador}/${inundaciones.length}`)

const contenidoJSON = JSON.stringify(inundaciones, null, 2);

try {
    fs.writeFileSync('inundaciones.json', contenidoJSON);
    console.log('✅ ¡Archivo "inundaciones.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}