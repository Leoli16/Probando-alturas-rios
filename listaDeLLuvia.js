process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"

let lista = fs.readFileSync("lluvias.json");
lista = JSON.stringify(lista);

let listaDeOriginales = await fetch("https://alerta.ina.gob.ar/pub/datos/estaciones&&format=json");
listaDeOriginales = listaDeOriginales.json();

for (let i of lista){

}