import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("registrosNegativos.json"));

let contador = 0;
for (let i in inundaciones){
    if (inundaciones[i].distanciaRio <= 15){
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
    fs.writeFileSync('registrosNegativos.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}