import fs from "fs"

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

let archivo = "registrosNegativosDesde1990_doble.json"
let registros = JSON.parse(fs.readFileSync(archivo))

let lista = []

for (let i of registros){
    let mes = parseInt(i.fechas[0].split("-")[1])
    let dia = parseInt(i.fechas[0].split("-")[2])
    let estacion = calcularEstacion(mes,dia)
    i.estacion = estacion

    lista.push(i)
}



const contenidoJSON = JSON.stringify(lista, null, 2);

try {
    fs.writeFileSync(archivo, contenidoJSON);
    console.log(`✅ ¡Archivo "${archivo}" guardado con éxito!`);
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}