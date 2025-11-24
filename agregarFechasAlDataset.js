import fs from "fs"

let inundaciones = JSON.parse(fs.readFileSync("registrosNegativosDesde1990_doble.json"))

let numerosDeDias = {
    lunes: 0,
    martes: 1,
    miercoles: 2,
    jueves: 3,
    viernes: 4,
    sabado: 5,
    domingo: 6,
}

function obtenerDiaSemana(anio, mes, dia) {
    // Crear la fecha (mes - 1 porque en JS los meses van de 0 a 11)
    const fecha = new Date(anio, mes - 1, dia);
  
    // Array con los nombres de los días en español
    const dias = [
      "domingo",
      "lunes",
      "martes",
      "miercoles",
      "jueves",
      "viernes",
      "sabado"
    ];
  
    // Obtener el índice del día y devolver el nombre
    return dias[fecha.getDay()];
}

function modificarFecha(anio, mes, dia, valor) {
    // Crear la fecha (mes - 1 porque en JS los meses van de 0 a 11)
    const fecha = new Date(anio, mes - 1, dia);
  
    // Modificar los días
    fecha.setDate(fecha.getDate() + valor);
  
    // Formatear el resultado en dd-mm-yyyy
    const diaFinal = String(fecha.getDate()).padStart(2, '0');
    const mesFinal = String(fecha.getMonth() + 1).padStart(2, '0');
    const anioFinal = fecha.getFullYear();
  
    return `${anioFinal}-${mesFinal}-${diaFinal}`;
}

for (let i in inundaciones){
    let numeros = inundaciones[i]["Date (YMD)"]
    numeros = numeros.split("/")
    let dia = numeros[0]
    let mes = numeros[1]
    let año = numeros[2]

    if (dia.length === 1){dia = "0"+dia}
    if (mes.length === 1){mes = "0"+mes}

    let fechaFormateada = `${año}-${mes}-${dia}`
    let diaSemanal = obtenerDiaSemana(año, mes, dia)
    diaSemanal = numerosDeDias[diaSemanal]
    
    let diaDeInicio = modificarFecha(año, mes, dia, -diaSemanal)
    
    let listaDeDias = []
    for  (let n = 0; n<7; n++){
        listaDeDias.push(diaDeInicio)
        let nuevaFecha = diaDeInicio.split("-")
        let nuevoAño = parseInt(nuevaFecha[0])
        let nuevoMes = parseInt(nuevaFecha[1])
        let nuevoDia = parseInt(nuevaFecha[2])
        diaDeInicio = modificarFecha(nuevoAño, nuevoMes, nuevoDia, 1)
    }
    inundaciones[i].fechas = listaDeDias;
}

const contenidoJSON = JSON.stringify(inundaciones, null, 2);

try {
    fs.writeFileSync('registrosNegativosDesde1990_doble.json', contenidoJSON);
    console.log('✅ ¡Archivo "registrosNegativosDesde1990_doble.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}