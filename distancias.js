import fs from "fs";
let inundaciones = fs.readFileSync("inundaciones.json");
inundaciones = JSON.parse(inundaciones);
let rios = fs.readFileSync("alturasHidrometricas.json");
rios = JSON.parse(rios);

function calcularDistancia(localidad, rio) {
    const R = 6371; // Radio de la Tierra en km
  
    const [lon1, lat1] = localidad;
    const [lon2, lat2] = rio;
  
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distancia = R * c;
    return distancia; // en kilómetros
}

// Ejemplo:
console.log(calcularDistancia([-54.0054, 34.2355], [-54.5903, 33.2355]));

for (let i in inundaciones){
    let distancias = [100000000]
    let nombres = ["nombre random"]
    for (let l of rios){
        let coordsLoc = [inundaciones[i].lat, inundaciones[i].lon]
        let coordsRio = [l.lat, l.lon]
        let distancia = calcularDistancia(coordsLoc, coordsRio);
        if (distancia < distancias[0]){
            distancias.unshift(distancia);
            nombres.unshift(l.estacion_nombre)
        }
    }
    console.log(inundaciones[i].Provincia, inundaciones[i].Departamento, distancias, nombres)
}
