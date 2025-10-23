import fs from "fs";

let inundaciones = await fs.readFileSync("inundaciones.json", "utf-8")
inundaciones = JSON.parse(inundaciones);

let pesos = {
    "I REC-RET-S.NIC": {"1": 0.50, "2": 0.50},
    "II ALMAG-BALV-RET-PAL": {"5": 0.45, "14": 0.30, "3": 0.15, "2": 0.10},
    "III MONS-CONST-BALV-S.CRIS": {"3": 0.55, "1": 0.45},
    "IV LA BOCA-S.TELMO-MONS": {"4": 0.65, "1": 0.35},
    "V BARRACAS-P.PATR-POMP": {"4": 1.00},
    "VI BOEDO-BALV-S.CRIS-ALM": {"5": 0.65, "3": 0.35},
    "VII CABALL-V.CRESPO": {"6": 0.65, "15": 0.35},
    "VIII CHAC-CABALL": {"15": 0.55, "6": 0.45},
    "IX PALERMO-COLEGIALES": {"14": 0.75, "13": 0.25},
    "X BELGR-NUÑEZ-SAAV-COGHL": {"13": 0.60, "12": 0.40},
    "XI FLORES": {"7": 1.00},
    "XII MITRE-S.RITA-FLORES": {"11": 0.55, "7": 0.45},
    "XIII P.AVELL-MATAD-LURO-LUGA": {"10": 0.50, "9": 0.50},
    "XIV PAT-CHAC-AGRON": {"15": 1.00},
    "XV V.URQUIZA-SAAV": {"12": 1.00},
    "XVI V.PUEYRREDON-DEVOTO": {"12": 0.70, "11": 0.30},
    "XVII DEVOTO-DEL PARQUE-REAL": {"11": 0.70, "10": 0.30},
    "XVIII VERS-M.CASTRO-V.SARSFI": {"10": 1.00},
    "XIX POMPEYA-SOLDATI": {"4": 0.55, "8": 0.45},
    "XX SOLDATI-LUGANO-RIACHUELO": {"8": 1.00},
    "XXI MATAD-LINIERS-LUGANO": {"9": 0.55, "8": 0.45}
  }
  
// Función para elegir una comuna aleatoria ponderada
function asignarComuna(circ) {
    const opciones = pesos[circ];
    if (!opciones) {
        throw new Error(`Circunscripción desconocida: ${circ}`);
    }

    const comunas = Object.keys(opciones);
    const probs = Object.values(opciones);

    // Generar un número aleatorio entre 0 y 1
    const rand = Math.random();
    let acumulado = 0;

    for (let i = 0; i < comunas.length; i++) {
        acumulado += probs[i];
        if (rand <= acumulado) {
            return comunas[i];
        }
    }

    // En caso de redondeos, devolver la última comuna
    return comunas[comunas.length - 1];
}

for (let i in inundaciones){
    let code = parseInt(inundaciones[i]["Code Departamento"])
    if (code >= 2001 && code <= 2022){
        let nuevaComuna = asignarComuna(inundaciones[i]["Departamento"])
    
        let nuevoCode = "20"
        if (nuevaComuna.length === 1){
            nuevoCode += "0"
        }
        nuevoCode += nuevaComuna;

        nuevaComuna = "Comuna " + nuevaComuna;
        console.log("Ex departamento: "+inundaciones[i]["Departamento"])
        console.log("Nueva Comuna:    " + nuevaComuna);
        console.log("nuevoCode:       "+ nuevoCode)
        
        inundaciones[i]["Departamento"] = nuevaComuna;
        inundaciones[i]["Code Departamento"] = nuevoCode;

        
    }
}

let contenidoJSON = JSON.stringify(inundaciones, null, 2);
try {
    fs.writeFileSync('inundaciones.json', contenidoJSON);
    console.log('✅ ¡Archivo "usuarios.json" guardado con éxito!');
    } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}