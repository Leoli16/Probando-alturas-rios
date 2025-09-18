process.env.NODE_TLS_REJECT_UNAUTHORIZED=0

import fs from "fs"
// No se necesita importar nada, fetch es global en Node.js v18+

const url = 'https://unidades-territoriales.obraspublicas.gob.ar/departments/page';

// 1. El payload se define igual que antes, en un objeto de JavaScript.
let payload = {
    'draw': '6',
    'columns[0][data]': 'name',
    'columns[0][name]': '',
    'columns[0][searchable]': 'true',
    'columns[0][orderable]': 'true',
    'columns[0][search][value]': '',
    'columns[0][search][regex]': 'false',
    'columns[1][data]': 'utaCode2020',
    'columns[1][name]': '',
    'columns[1][searchable]': 'true',
    'columns[1][orderable]': 'true',
    'columns[1][search][value]': '',
    'columns[1][search][regex]': 'false',
    'columns[2][data]': 'province',
    'columns[2][name]': '',
    'columns[2][searchable]': 'true',
    'columns[2][orderable]': 'true',
    'columns[2][search][value]': '',
    'columns[2][search][regex]': 'false',
    'columns[3][data]': 'provinceId',
    'columns[3][name]': '',
    'columns[3][searchable]': 'true',
    'columns[3][orderable]': 'true',
    'columns[3][search][value]': '',
    'columns[3][search][regex]': 'false',
    'columns[4][data]': '4',
    'columns[4][name]': '',
    'columns[4][searchable]': 'true',
    'columns[4][orderable]': 'false',
    'columns[4][search][value]': '',
    'columns[4][search][regex]': 'false',
    'order[0][column]': '0',
    'order[0][dir]': 'asc',
    'start': '0',
    'length': '100',
    'search': '62091',
    'province': ''
  };



// 3. Creamos una función asíncrona para realizar la llamada.
async function enviarSolicitudConFetch(code, actual, total) {
  payload.search = code;  
  // 2. La conversión a URLSearchParams sigue siendo la mejor manera de manejar los datos.
  let data = new URLSearchParams(payload);
  try {
    const response = await fetch(url, {
      method: 'POST', // Debemos especificar el método
      headers: {
        // Debemos especificar el Content-Type manualmente
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: data // El cuerpo de la solicitud con los datos formateados
    });

    // 4. Verificamos si la respuesta fue exitosa (status 200-299).
    if (!response.ok) {
      // Si no fue exitosa, lanzamos un error para que lo capture el catch.
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    // 5. Convertimos la respuesta a JSON. Esto también devuelve una promesa.
    const responseData = await response.json();

    if(responseData.data.length === 0){
        console.log(`Mal Ahí bro - ${actual}/${total}`)
    }


  } catch (error) {
    // Capturamos cualquier error, ya sea de red o el que lanzamos manualmente.
    console.error('Ocurrió un error al realizar la petición:', error.message);
  }
}




let content = fs.readFileSync("cantidadDeRegistrosPorLocalidad.json","utf-8");
content = JSON.parse(content);

let counter = 1;
for (let i in content){
    // Ejecutamos la función.
    if (i.length === 4){
      await enviarSolicitudConFetch(`0${i}`, counter, content.length);
    }
    else{
      await enviarSolicitudConFetch(i, counter, content.length);
    }
    
    counter+=1;
}