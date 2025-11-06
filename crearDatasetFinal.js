import fs from "fs";

const url =  "https://archive-api.open-meteo.com/v1/archive?latitude=52.52&longitude=13.41&start_date=1984-02-19&end_date=1984-02-20&hourly=precipitation"


let inundaciones = JSON.parse(fs.readFileSync("inundaciones.json"));
let rios = JSON.parse(fs.readFileSync("riosNecesariosCon1.json"));
let datosDeRios = JSON.parse(fs.readFileSync("datosDeRios.json"));

let registros = [];

let conseguidos = 0;

for (let i in inundaciones){
    let numeros = inundaciones[i]["Date (YMD)"].split("/")
    let dia = numeros[0]
    let mes = numeros[1]
    let año = numeros[2]
    if (dia.length === 1){dia = "0"+dia};
    if (mes.length === 1){mes = "0"+mes};

    let lat = inundaciones[i].lat;
    let lon = inundaciones[i].lon;

    let seriesid;
    let sitecode;
    for (let r of rios){
        if (r.estacion_nombre === inundaciones[i].rio1.nombre){
            seriesid = r.seriesid;
            sitecode = r.sitecode;
        }
    }
    
    let code = seriesid+"-"+sitecode;
    let fechaArmada = `${año}-${mes}-${dia}`;
    let fechaTrucha = `2024-${mes}-${dia}`
    let encontrado = false;
    for (let dato in datosDeRios){
        if (dato === code){
            for (let v of datosDeRios[dato]){
                if (v.timestart.startsWith(fechaArmada)){
                    encontrado = true;
                }
            }
        }
    }

    if (encontrado){
        conseguidos+=1;
    }
    
}

console.log(`Registros que tenemos datos completos: ${conseguidos}/${inundaciones.length}`);