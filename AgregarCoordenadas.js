process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"
import fetch from 'node-fetch';

let lista = fs.readFileSync("caudales.json");
lista = JSON.parse(lista);




for (let i in lista){
    let provincia = lista[i]["Provincia"];
    let localidad = lista[i]["Departamento"];
    console.log(`${parseInt(i)+1}/${lista.length}`);
    let data = await fetch(`https://nominatim.openstreetmap.org/search?q=${localidad},${provincia},argentina&format=json`);
    data = await data.json();
    console.log(data)
}

const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('inundaciones.json', contenidoJSON);
    console.log('✅ ¡Archivo "lluvias.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}