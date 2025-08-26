import fs from "fs";

let content = fs.readFileSync("caudales.json","utf-8");

content = JSON.parse(content);

console.log(content);
console.log(content.length);