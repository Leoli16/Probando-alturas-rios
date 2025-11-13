import fs from "fs"

let datasetNegativos = JSON.parse(fs.readFileSync("registrosNegativos.json"));
let datasetPositivos = JSON.parse(fs.readFileSync("inundaciones.json"));

function generarNumeroRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let lista =  []
for (let n of datasetNegativos){
    let listaDeFechas = [];
    for (let p of datasetPositivos){
        if (n["Code Departamento"] === p["Code Departamento"]){
            listaDeFechas = listaDeFechas.concat(p.fechas)
        }
    }
    let año = generarNumeroRandom(1970, 2015)
    let mes = generarNumeroRandom(1,12) 
    let dia = generarNumeroRandom(1,28)

    let fechaNormalArmada = `${dia}/${mes}/${año}`
    let fechaRaraArmada = `${año}-${mes}-${dia}`
    
    while (listaDeFechas.includes(fechaRaraArmada)){
        año = generarNumeroRandom(1970, 2015)
        mes = generarNumeroRandom(1,12) 
        dia = generarNumeroRandom(1,28)
    
        fechaNormalArmada = `${dia}/${mes}/${año}`
        fechaRaraArmada = `${año}-${mes}-${dia}`
    }
    n["Date (YMD)"] = fechaNormalArmada;
    lista.push(n);
}

lista = lista.concat(lista);






const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync('registrosNegativos.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativos.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}