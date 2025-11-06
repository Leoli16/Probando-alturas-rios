import fs from "fs"

let datosDeRios = JSON.parse(fs.readFileSync("datosDeRios.json"));
let dataset = {}
let fecha = "uysdkjf"

for (let i in datosDeRios){
    let valoresIguales = [];
    dataset[i] = [];
    let primeraVez = true;
    for (let x of datosDeRios[i]){
        if (x.timestart.slice(0,10) === fecha){
            valoresIguales.push(x.valor);
        }
        else{
            if (!primeraVez){
                let sumador = 0;
                for (let s of valoresIguales){
                    sumador+=s;
                }
                dataset[i].push({valor: sumador/valoresIguales.length, timestart: fecha})
            }else{
                primeraVez= false
            }

        }
        fecha = x.timestart.slice(0,10);
    }
}


const contenidoJSON = JSON.stringify(dataset, null, 2);

try {
    fs.writeFileSync('pruebaFetchs.json', contenidoJSON);
    console.log('✅ ¡Archivo "pruebaFetchs.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}