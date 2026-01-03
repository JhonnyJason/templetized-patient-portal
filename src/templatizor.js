//##############################################################################
import { DOMParser, Node } from "jsr:@b-fuze/deno-dom"
import fs, { cp } from "node:fs"
import { resolve } from "@std/path"
import html2pug from "https://raw.githubusercontent.com/JhonnyJason/html2pug/refs/heads/main/src/index.js"

//##############################################################################
import { textStyleTags, textMetaTags, regularTags } from "./htmlTags.js"

//##############################################################################
const log  = console.log
const olog = (arg) => { console.log(JSON.stringify(arg, null, 4)) }

//##############################################################################
// global variables
const inputHTMLPath = resolve(".", "dissected/stripped.html")
const outputDocumentHeadPath = resolve(".", "dissected/document-head.mustache")
const outputBodyPath = resolve(".", "dissected/body.mustache")
const outputJSONPath = resolve(".", "dissected/full-content.json")
const outputMetaPath = resolve(".", "dissected/meta.json")

//##############################################################################
// static string definitions
const htmlTag = "html(lang=languageTag)\n"
// const bodySection = "\n\n    include styles-include.pug\nbody\n    include ../../source/index/indexbody.pug\n    include scripts-include.pug"
const bodySection = "\n\n        include {{{stylesInclude}}}\n    body\n        include {{{bodyInclude}}}\n        include {{{scriptsInclude}}}"

//##############################################################################
const textAttributes = ["aria-label", "placeholder"]

//##############################################################################
// global variables
var doc = null
var idBase = "unuID" //unused ID
var idCount = 0

//##############################################################################
const content = {}
const metaMap = {}
const attributeReplacements = []


//##############################################################################
// addToContent(content, "stylesInclude", "styles-include.pug")
content.stylesInclude = "styles-include.pug"
// addToContent(content, "bodyInclude", "../../source/index/indexbody.pug")
content.bodyInclude = "../../source/index/indexbody.pug"
// addToContent(content, "scriptsInclude","scripts-include.pug")
content.scriptsInclude = "scripts-include.pug"

//##############################################################################
var keyBase = "unuKey" // unused Key
var keyCount = "0"

//##############################################################################
function prepareAndWriteDocumentHead(pugString) {
    pugString = pugString.replace('html\n', htmlTag)
    pugString = pugString.replace('\n    body', bodySection)
    pugString = 'doctype html\n' + pugString
    fs.writeFileSync( outputDocumentHeadPath, pugString)
}

//##############################################################################
// The main Program
function main() {
    const fileString = fs.readFileSync(inputHTMLPath, { encoding: 'utf8' })
    // log(fileString)

    doc = new DOMParser().parseFromString(fileString, 'text/html')
    ensureUnusedIdBase()

    const head = doc.head
    const body = doc.body

    // works already TODO uncomment when everything else works as well ;-)
    templatize(head, content, "")
    var pugHeadMustache = toPug(head.outerHTML)
    pugHeadMustache = processAttributeReplacements(pugHeadMustache)
    prepareAndWriteDocumentHead(pugHeadMustache)    

    templatize(body, content, "")
    cleanOutIndexKeys(content)
    writeDynamicTemplatesToBody(body, content)

    const fullContentString = JSON.stringify(content, null, 4)
    fs.writeFileSync(outputJSONPath, fullContentString)
    const metaString = JSON.stringify(metaMap, null, 4)
    fs.writeFileSync(outputMetaPath, metaString)


    const bodyHTML = body.innerHTML
    // log(bodyHTML)
    var pugBodyMustache = toPugFragment(bodyHTML)
    pugBodyMustache = processAttributeReplacements(pugBodyMustache)
    // log(pugBody)
    fs.writeFileSync(outputBodyPath, pugBodyMustache)
    return
}

//##############################################################################
main();

//##############################################################################
function toPugFragment(html) {
    var result = html2pug(html, { fragment: true })
    result = result.replaceAll('\t', '    ')
    result = result.replaceAll('\nctemplate#', '\ntemplate#')
    return result 
}

function toPug(html) {
    var result = html2pug(html)
    result = result.replaceAll('\t', '    ')
    result = result.replaceAll('\nctemplate#', '\ntemplate#')
    return result 
}

function processAttributeReplacements(str) {
    for(var i = 0; i < attributeReplacements.length; i++) {
        var replacor = attributeReplacements[i]
        str = str.replaceAll(replacor.pattern, replacor.newContent)
    }
    return str
}

function cleanOutIndexKeys(content) {
    const keys = Object.keys(content)
    for(var i = 0; i < keys.length; i++ ) {
        var key = keys[i]
        if(typeof content[key] === "string") { continue }
        if(typeof content[key] === "number") { cleanOut(content, key) }
        if(typeof content[key] === "object") { cleanOutIndexKeys(content[key])}
    }
}

function cleanOut(content, key) {
    const oldMeta = metaMap[key]
    const newKey = key + ":nth-child(1)"
    metaMap[newKey] = oldMeta

    delete metaMap[key]
    delete content[key]
}

//##############################################################################
// the functions
function templatizeDynamicList(el, content, selector) {
    // log("templatizeDynamicList")
    // log(content)
    // selector = extendselector(el, selector)
    selector = newselector(el, selector)
    // log(selector)

    const subContent = {}
    const id = getUnusedID()
    const cPath = getDynamicContentPath("list-item:"+id)
    subContent.id = id

    // get children of el
    const childEl =  el.firstElementChild
    el.innerHTML = ""
    // if(childEl.getAttribute("dynamic-list-item") === null) { throw new Error("List Item not correctly marked!")}
    
    el.removeAttribute("dynamic-list")
    el.setAttribute("dynamic-id", id)
    
    templatize(childEl, subContent, "#"+id)

    childEl.setAttribute("dynamic-data-index","{{{index}}}")
    const template = childEl.outerHTML
    
    // log(subContent)
    // log(template)

    if(!content.dynamicList) {content.dynamicList = {}}
    content.dynamicList[id] = template
    // log(content)

    Object.keys(subContent).forEach((key) => {
        const meta = metaMap[key]
        delete metaMap[key]
        subContent[key] = meta
    })

    fs.writeFileSync(cPath, JSON.stringify(subContent, null, 4))
    return
}

//##############################################################################
function templatizeDynamic(el, content, selector) {
    // log("templatizeDynamic")
    // log(content)
    // selector = extendselector(el, selector)
    selector = newselector(el, selector)
    // log(selector)

    const subContent = {}
    const id = getUnusedID()
    const cPath = getDynamicContentPath(id)
    subContent.id = id
    
    el.removeAttribute("dynamic")
    el.setAttribute("dynamic-id", id)
    
    templatize(el, subContent, "#"+id)

    const template = el.innerHTML
    el.innerHTML = ""
    // log(template)
    // log(subContent)

    if(!content.dynamic) {content.dynamic = {}}
    content.dynamic[id] = template

    Object.keys(subContent).forEach((key) => {
        const meta = metaMap[key]
        delete metaMap[key]
        subContent[key] = meta
    })
    // log(content)
    fs.writeFileSync(cPath, JSON.stringify(subContent, null, 4))
    // throw new Error("We shall not Pass!")
    // return
}

//##############################################################################
function templatizeStatic(el, content, selector) {
    // log("templatizeStatic")
    // selector = extendselector(el, selector)
    selector = newselector(el, selector)
    selector = addIndexInfo(selector, content)

    // log("selector: "+selector)

    const nodes = el.childNodes
    // log(nodes)

    var i = 0
    var node = null
    var hasText = false
    const relevantNodes = []
    var realText = ""

    for (; i < nodes.length; i++) {
        node = nodes[i]
        // log(node.nodeName)

        switch(node.nodeType) {
            case Node.ELEMENT_NODE: // Element node
                if (isEmptyLeave(el) || hasNoText(el)) { break }
                relevantNodes.push(node)
                break
            case Node.TEXT_NODE: // Text Node
                realText = node.textContent.replace(/\s/g, "")    
                if (realText) { hasText = true }
                break
            case Node.COMMENT_NODE: break // Comment node - be silent! :-)
            default:
                log("This Element was no Text nor Element Node.")
                log("  > nodeType: "+node.nodeType)
        }
    }

    // log("hasText: "+hasText)
    if(hasText) {
        const key = getUnusedKey()
        const params = {
            selector: selector,
            pugString: "!{templated."+key+"}",
            pugKey: key,
            content: el.innerHTML
        }
        // log("We react on having a text here!")
        addToContent(content, params)
        el.innerText = "{{{"+selector+"}}}" 
        return
    }

    // log("relevantNodes.length: "+relevantNodes.length)
    for(i = 0; i < relevantNodes.length; i++) {
        templatize(relevantNodes[i], content, selector)
    }
    return
}

//##############################################################################
function templatizeAttributes(el, content, selector) {
    selector = newselector(el, selector)

    for(var i = 0; i < textAttributes.length; i++) {
        var attrName = textAttributes[i]
        var attr = el.getAttribute(attrName)
        if(attr) {
            selector += "["+attrName+"]"
            var key = getUnusedKey()
            const params = {
                selector: selector,
                pugKey: key,
                pugString: "templated."+key,
                content: attr
            }    
            addToContent(content, params)
            
            const replacor = {
                pattern: attrName+"='"+attr+"'",
                newContent: attrName+"={{{"+selector+"}}}"
            }
            attributeReplacements.push(replacor)
        }
    }
}

//##############################################################################
// templatize: top + static recursive call
function templatize(el, content, selector) {
    // log("templatize "+selector)
    templatizeAttributes(el, content, selector)
    if (isEmptyLeave(el) || hasNoText(el)) { return } // no relevant content here
    // log("having relevant content...")
        
    if (typeof el.getAttribute("dynamic") === "string") {
        return templatizeDynamic(el, content, selector) 
    } else if (typeof el.getAttribute("dynamic-list") === "string") {
        return templatizeDynamicList(el, content, selector)
    } else {
        return templatizeStatic(el, content, selector)
    }
}


//##############################################################################
// function selectorToKey(selector) {
//     var key = selector.replaceAll("<", "")
//     key = key.replaceAll("/")
// }


//##############################################################################
function getDynamicContentPath(id) { return resolve(".", "dissected/"+id+".json") }
function getUnusedID() { return idBase + idCount++ }
function getUnusedKey() { return keyBase + keyCount++ }

function addToContent(cObj, params) {
    if(params.pugString) {
        cObj[params.selector] = params.pugString
    } else {
        cObj[params.selector] = params.content
    }
    metaMap[params.selector] = {
        pugKey: params.pugKey,
        pugString: params.pugString,
        content: params.content
    }
}

//##############################################################################
function extendselector(el, selector) {
    const id = el.id
    const cls = el.className
    if (id) { selector += " > #"+id }
    else {
        if (cls) { selector += " > ."+cls.split(" ").join(".") }
        else { selector += " > "+el.tagName.toLowerCase()}
    }

    return selector
}

function newselector(el, selector) {
    const id = el.id
    if (id) { return "#"+id }
    
    const cls = el.className
    if (cls) { selector += " > ."+cls.split(" ").join(".") }
    else { selector += " > "+el.tagName.toLowerCase()}

    return selector
}

function addIndexInfo(selector, content) {
    if(typeof content[selector] === "string") {
        const oldContent = content[selector]
        content[selector] = 2
        const newSelectorOld = selector + ":nth-child(1)"
        content[newSelectorOld] = oldContent

        return selector + ":nth-child(2)" 
    } 
    
    if(typeof content[selector] === "number") {    
        const num = ++content[selector]
        return selector + ":nth-child("+num+")"
    }

    return selector
}


//##############################################################################
function writeDynamicTemplatesToBody(body, content) {
    const dynamic = content.dynamic
    delete content.dynamic
    
    const dynamicList = content.dynamicList
    delete content.dynamicList

    Object.keys(dynamic).forEach((key) => {
        const templateEl = doc.createElement("ctemplate")
        templateEl.innerHTML = dynamic[key]
        templateEl.id = key
        body.append(templateEl)
    });

    Object.keys(dynamicList).forEach((key) => {
        const templateEl = doc.createElement("ctemplate")
        templateEl.innerHTML = dynamicList[key]
        templateEl.id = key
        body.append(templateEl)
    })

}

//##############################################################################
// hasNoText
function hasNoText(el) {
    var text = el.innerText
    // log("_____________analyzing innerText_____________")
    // log(text);
    if (text) {
        text = text.replace(/\s/g, "");
        // log("text.length: "+text.length)
        if (text) { return false }
    }

    // log(" -> no text!");    
    return true;
}

//##############################################################################
// hasNoText
function isEmptyLeave(el) {
    var html = el.innerHTML
    // log("_____________analyzing innerHTML_____________")
    // log(html);
    if (html) {
        html = html.replace(/\s/g, "");
        // log("html.length: "+html.length)
        if (html) { return false }
    }

    // log(" -> is empty leaf!");
    return true;
}

//##############################################################################
// ensureUnusedIdBase
function ensureUnusedIdBase() {
    // if we already have templatized ids we would override the fakeIds
    // no previous "fakeId"s => fakeId0, fakeId1, fakeId2, ...
    // previous fakeId0 exists then => fakeIdx0, fakeIdx1, fakeIdx2, ...
    // previous fakeIdx0 exists then => fakeIdxx0, fakeIdxx1, fakeIdxx2, ...
    // and so on
    while (doc.getElementById('#' + idBase + '0')) { idBase += 'x'; }
}