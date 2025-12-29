import M from "npm:mustache"
import fs from "node:fs"
import { resolve } from "@std/path";
import { normalize } from "node:path";

//##############################################################################
const templatePath = resolve(".", "dissected/full-template.mustache")
const contentPath = resolve(".", "dissected/full-content.json")
const outputPath = resolve(".", "dissected/normalized.html")

const fakeContent = "INHALT-XXX"

//##############################################################################
// The main Program
function main() {
    const template = fs.readFileSync(templatePath, {encoding: "utf8"})
    const content = JSON.parse(fs.readFileSync(contentPath, {encoding: "utf8"}))

    normalizeObjectContent(content, fakeContent)

    const outputHTML = M.render(template, content)
    fs.writeFileSync(outputPath, outputHTML)
}

main()


//##############################################################################
function normalizeObjectContent(obj, cnt) {
    const keys = Object.keys(obj)
    // console.log(keys)
    
    var i = 0
    var key = ""

    for(i = 0; i < keys.length; i++ ) {
        key = keys[i]
        // console.log(key)
        
        if(typeof obj[key] == "string") { obj[key] = cnt } 
        else if(typeof obj[key] == "object") { normalizeObjectContent(obj[key], cnt) } 
        else { console.error("Unexpected Object type: "+(typeof obj[key])) }

    }
}
