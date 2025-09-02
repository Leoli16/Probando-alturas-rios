import fs from "fs";

let content = fs.readFileSync("lluvias.json","utf-8");

content = JSON.parse(content);

console.log(content);
console.log(content.length);