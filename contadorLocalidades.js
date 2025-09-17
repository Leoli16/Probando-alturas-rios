import fs from "fs";

function contar(archivo){
    let miObjeto = {}
    let content = fs.readFileSync(archivo,"utf-8");
    content = JSON.parse(content)

    for (let i in content){
        if (miObjeto.hasOwnProperty(content[i]["Code Departamento"])){
            miObjeto[content[i]["Code Departamento"]] = miObjeto[content[i]["Code Departamento"]] + 1;
        }else{
            miObjeto[content[i]["Code Departamento"]] = 1;
        }
    }

    const contenidoJSON = JSON.stringify(miObjeto, null, 2);

try {
    fs.writeFileSync('cantidadLocalidades.json', contenidoJSON);
    console.log('✅ ¡Archivo "cantidadLocalidades.json" guardado con éxito!');
  } catch (error) {
    console.error('❌ Error al guardar el archivo:', error);
}
}

contar("inundaciones.json");