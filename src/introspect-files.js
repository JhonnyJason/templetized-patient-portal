//##############################################################################
import { Application } from "https://deno.land/x/oak/mod.ts";
import { resolve } from "@std/path";
import fs from "node:fs"

//##############################################################################
const filesPath = resolve(".", Deno.args[0])
const app = new Application();

//##############################################################################
const allFileNames = fs.readdirSync(filesPath)
if(allFileNames.length <= 0) { throw new Error("No Files in directory!") }

const indexFilename = allFileNames.includes("index.html")? "index.html" : allFileNames[0]

//##############################################################################
async function handler(ctx) {
    try { await ctx.send({ root: filesPath, index: indexFilename }) } 
    catch {
        ctx.response.status = 404;
        ctx.response.body = "404 File not found";
    }
}

//##############################################################################
app.use(handler);
console.log("Serving HTML from "+filesPath)

//##############################################################################
const maxAttempts = 100
var listenPort = 8000
var attempts = 0 
var done = false

//##############################################################################
while((attempts < maxAttempts) && !done) {
    try {
        await app.listen({ port: listenPort })
        done = true
    } catch {
        listenPort++
        attempts++
    }
}

//##############################################################################
if (attempts == maxAttempts) {console.error("Reached max Attempts!")}