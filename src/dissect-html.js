//##############################################################################
import fs from "node:fs"
import { resolve } from "@std/path";

//##############################################################################
const filePath = resolve(".", Deno.args[0])
console.log(filePath)
const strippedHTMLPath = resolve(".", "dissected/stripped.html")
const styleCSSPath = resolve(".", "dissected/style.css")
const scriptJSPath = resolve(".", "dissected/script.js")

//##############################################################################
const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' })

//##############################################################################
const strippedSegments = ["preStyle", "styleToScript", "postScript"]

//##############################################################################
const styleStart = fileContent.indexOf("<style>")
const styleEnd = fileContent.indexOf("</style>")

const scriptStart = fileContent.indexOf("<script>")
const scriptEnd = fileContent.indexOf("</script>")

//##############################################################################
// slice preStyle Segment
var start = 0
var end = styleStart
strippedSegments[0] = fileContent.slice(start, end)

// slice cssContent
start = styleStart + 7 // "<style>".length == 7
end = styleEnd
const styleCSSContent = fileContent.slice(start, end) 

// slice styleToScript Segment
start = styleEnd + 8 // "</style>".length == 8
end = scriptStart
strippedSegments[1] = fileContent.slice(start, end)

// slice scriptContent
start = scriptStart + 8 // "<script>".length == 8
end = scriptEnd
const scriptJSContent = fileContent.slice(start, end)

// slice postScript Segment
start = scriptEnd + 9 // "</script>".length == 9
strippedSegments[2] = fileContent.slice(start) // slice rest

//##############################################################################
const strippedHTMLContent = strippedSegments[0] + strippedSegments[1] + strippedSegments[2]

fs.writeFileSync(strippedHTMLPath, strippedHTMLContent)
fs.writeFileSync(styleCSSPath, styleCSSContent)
fs.writeFileSync(scriptJSPath, scriptJSContent)
