import csv from 'csvtojson';
import fs from 'fs';

const inputCsvFile = 'inundaciones.csv'; // Cambia por tu archivo CSV
const outputJsonFile = 'inundaciones.json';

async function convertirCsvAJson() {
  try {
    const jsonArray = await csv().fromFile(inputCsvFile);
    
    // Guarda el resultado en un archivo JSON
    fs.writeFileSync(outputJsonFile, JSON.stringify(jsonArray, null, 2), 'utf8');
    
    console.log(`Archivo JSON creado: ${outputJsonFile}`);
  } catch (error) {
    console.error('Error al convertir CSV a JSON:', error);
  }
}

convertirCsvAJson();
