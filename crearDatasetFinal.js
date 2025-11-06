import fs from "fs";

const url =  "https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&start_date=2025-10-21&end_date=2025-11-04&daily=precipitation_sum&timezone=auto"

function calcularEstacion(mes, dia) {
    // Asegurarnos de que los valores de mes y dia sean válidos
    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
        return "Fecha inválida";
    }

    // Definir las fechas aproximadas de inicio de las estaciones (en el hemisferio sur)
    const estaciones = {
        "invierno": { inicio: { mes: 6, dia: 21 }, fin: { mes: 9, dia: 20 } },
        "primavera": { inicio: { mes: 9, dia: 21 }, fin: { mes: 12, dia: 20 } },
        "verano": { inicio: { mes: 12, dia: 21 }, fin: { mes: 3, dia: 20 } },
        "otoño": { inicio: { mes: 3, dia: 21 }, fin: { mes: 6, dia: 20 } }
    };

    // Convertir mes y dia a una fecha para comparación
    const fechaInput = new Date(2023, mes - 1, dia); // Año no importa aquí, solo mes y día

    for (let estacion in estaciones) {
        const { inicio, fin } = estaciones[estacion];
        const fechaInicio = new Date(2023, inicio.mes - 1, inicio.dia);
        const fechaFin = new Date(2023, fin.mes - 1, fin.dia);

        // Si la fecha ingresada está dentro del rango de la estación, la retornamos
        if ((fechaInput >= fechaInicio && fechaInput <= fechaFin) || 
            (fin.mes < inicio.mes && (fechaInput >= fechaInicio || fechaInput <= fechaFin))) {
            return estacion; // Capitaliza la primera letra
        }
    }

    return "ERROR";
}

let inundaciones = JSON.parse(fs.readFileSync("inundaciones.json"));
let rios = JSON.parse(fs.readFileSync("riosNecesariosCon1.json"));
let datosDeRios = JSON.parse(fs.readFileSync("datosDeRios.json"));

let registros = [];

let conseguidos = 0;
let truchados = 0;
let sinCodigo = 0;
for (let i in inundaciones){
    let valores = {};

    valores.id = inundaciones[i]["Code Departamento"]
    let numeros = inundaciones[i]["Date (YMD)"].split("/")
    let dia = numeros[0]
    let mes = numeros[1]
    let año = numeros[2]
    if (dia.length === 1){dia = "0"+dia};
    if (mes.length === 1){mes = "0"+mes};
    if (inundaciones[i]["Code Departamento"] === ""){
        sinCodigo +=1;
        // console.log(`${i}/${inundaciones.length}`);
        continue
    }
    
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
                    valores.altura = v.valor;
                    // let precitaciones = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${año}-${mes}-${dia}&end_date=${año}-${mes}-${dia}&daily=precipitation_sum&timezone=auto`);
                    // precitaciones = await precitaciones.json();
                    // precitaciones = precitaciones.daily.precipitation_sum;
                    // valores.precitaciones = precitaciones[0]
                    let estacion = calcularEstacion(mes, dia);
                    valores.estacion = estacion;
                    valores.se_inunda = 1;
                    // registros.push(valores);
                    // console.log(`${i}/${inundaciones.length}`)
                    conseguidos+=1;
                    break;
                }
            }
        }
    }
    for (let dato in datosDeRios){
        if (dato === code){
            for (let v of datosDeRios[dato]){
                if (v.timestart.startsWith(fechaTrucha)){
                    encontrado = true;
                    valores.altura = v.valor;
                    //let precitaciones = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${año}-${mes}-${dia}&end_date=${año}-${mes}-${dia}&daily=precipitation_sum&timezone=auto`);
                    //precitaciones = await precitaciones.json();
                    //precitaciones = precitaciones.daily.precipitation_sum;
                    //valores.precitaciones = precitaciones[0]
                    let estacion = calcularEstacion(mes, dia);
                    valores.estacion = estacion;
                    valores.se_inunda = 1;
                    registros.push(valores);
                    // console.log(`${i}/${inundaciones.length} truchado`)
                    // console.log(valores);
                    truchados +=1;
                    break;
                }
            }
            console.log(`${dato}: ${dia}/${mes}/${año}`)
        }
    }
}

console.log(`Registros que tenemos datos completos: ${conseguidos}/${inundaciones.length}`);
console.log(`Registros medio truchos: ${truchados}/${inundaciones.length}`);
console.log(`Total que tenemos: ${conseguidos+truchados}/${inundaciones.length}`);
console.log(`Total real: ${conseguidos+truchados}/${inundaciones.length-sinCodigo}`)