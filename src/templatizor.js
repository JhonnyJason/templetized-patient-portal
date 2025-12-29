//##############################################################################
import { DOMParser, Node } from "jsr:@b-fuze/deno-dom"
import fs, { cp } from "node:fs"
import { resolve } from "@std/path"
// import html2pug from "https://raw.githubusercontent.com/JhonnyJason/html2pug/refs/heads/main/src/index.js"
import html2pug from "npm:html2pug"

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


//##############################################################################
// static string definitions
const htmlTag = "html(lang=languageTag)\n"
const bodySection = "\n\n    include styles-include.pug\nbody\n    include ../../source/index/indexbody.pug\n    include scripts-include.pug"

//##############################################################################
// global variables
var doc = null;
var idBase = "unuID"; //unused ID
var idCount = 0;
const content = {};

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
    // templatize(head, content, "")
    // var pugHead = toPug(head.outerHTML)
    // prepareAndWriteDocumentHead(pugHead)    

    templatize(body, content, "")
    writeDynamicTemplatesToBody(body, content)

    const fullContentString = JSON.stringify(content, null, 4)
    fs.writeFileSync(outputJSONPath, fullContentString)
    
    const bodyHTML = body.innerHTML
    // log(bodyHTML)
    const pugBody = toPugFragment(bodyHTML)
    // log(pugBody)
    fs.writeFileSync(outputBodyPath, pugBody)
    return
}

//##############################################################################
main();

//##############################################################################
function toPugFragment(html) {
    var result = html2pug(html, { tabs: true, fragment: true })
    result = result.replaceAll('\t', '    ')
    result = result.replaceAll('\nctemplate#', '\ntemplate#')
    return result 
}

function toPug(html) {
    var result = html2pug(html, { tabs: true })
    result = result.replaceAll('\t', '    ')
    result = result.replaceAll('\nctemplate#', '\ntemplate#')
    return result 
}

//##############################################################################
// the functions
function templatizeDynamicList(el, content, breadcrumbs) {
    // log("templatizeDynamicList")
    // log(content)
    breadcrumbs = extendBreadcrumbs(el, breadcrumbs)
    // log(breadcrumbs)

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
    
    templatize(childEl, subContent, "")

    childEl.setAttribute("dynamic-data-index","{{{index}}}")
    const template = childEl.outerHTML
    
    // log(subContent)
    // log(template)

    if(!content.dynamicList) {content.dynamicList = {}}
    content.dynamicList[id] = template
    // log(content)

    fs.writeFileSync(cPath, JSON.stringify(subContent, null, 4))
    return
}

//##############################################################################
function templatizeDynamic(el, content, breadcrumbs) {
    // log("templatizeDynamic")
    // log(content)
    breadcrumbs = extendBreadcrumbs(el, breadcrumbs)
    // log(breadcrumbs)

    const subContent = {}
    const id = getUnusedID()
    const cPath = getDynamicContentPath(id)
    subContent.id = id
    
    el.removeAttribute("dynamic")
    el.setAttribute("dynamic-id", id)
    
    templatize(el, subContent, "")

    const template = el.innerHTML
    el.innerHTML = ""
    // log(template)
    // log(subContent)

    if(!content.dynamic) {content.dynamic = {}}
    content.dynamic[id] = template

    // log(content)
    fs.writeFileSync(cPath, JSON.stringify(subContent, null, 4))
    // throw new Error("We shall not Pass!")
    // return
}

//##############################################################################
function templatizeStatic(el, content, breadcrumbs) {
    // log("templatizeStatic")
    breadcrumbs = extendBreadcrumbs(el, breadcrumbs)

    // log("breadcrumbs: "+breadcrumbs)

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
            default:
                log("This Element was no Text nor Element Node.")
        }
    }

    // log("hasText: "+hasText)
    if(hasText) {
        // log("We react on having a text here!")
        content[breadcrumbs] = el.innerHTML
        el.innerText = "{{{"+breadcrumbs+"}}}" 
        return
    }

    // log("relevantNodes.length: "+relevantNodes.length)
    for(i = 0; i < relevantNodes.length; i++) {
        templatize(relevantNodes[i], content, breadcrumbs)
    }
    return
}

//##############################################################################
// templatize: top + static recursive call
function templatize(el, content, breadcrumbs) {
    // log("templatize "+breadcrumbs)
    if (isEmptyLeave(el) || hasNoText(el)) { return } // no relevant content here
    // log("having relevant content...")
        
    if (typeof el.getAttribute("dynamic") === "string") { 
        return templatizeDynamic(el, content, breadcrumbs) 
    } else if (typeof el.getAttribute("dynamic-list") === "string") {
        return templatizeDynamicList(el, content, breadcrumbs)
    } else {
        return templatizeStatic(el, content, breadcrumbs)
    }
}


//##############################################################################
// function breadCrumbsToKey(breadcrumbs) {
//     var key = breadcrumbs.replaceAll("<", "")
//     key = key.replaceAll("/")
// }


//##############################################################################
function getDynamicContentPath(id) {return resolve(".", "dissected/"+id+".json")}
function getUnusedID() {return idBase + idCount++}

//##############################################################################
function extendBreadcrumbs(el, breadcrumbs) {
    const id = el.id
    const cls = el.className
    if (id) { breadcrumbs += "#"+id+"#" }
    else {
        if (cls) { breadcrumbs += "("+cls+")"}
        else { breadcrumbs += "_"+el.tagName+"_"} 
    }

    return breadcrumbs
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
// checkNode
// checkNode
function checkNode(node) {
    //console.log(node.html());
    if (hasNoText(node)) {
        return;
    }

    if (!node.html()) { //we neither have content nor children
        return; //so we leave the empty leave
    }

    var id = node.attr("id");

  //pfusch for excluding the menu
//   if (id == "menu")
//     return;
  //pfusch for excluding nasty Labels
//   if (node.is("label"))
//     return;

    //check next
    var children = node.children();
    var nonNodeElements = 0;

    for (var i = 0; i < children.length; i++) {
        if (isSubTagToIgnore(children[i])) {
            //console.log("!! -  We have a nonNode element here  -  !! ");
            nonNodeElements++;
        } else {
            checkNode($(children[i]));
        }
    }

    if (!children.length || (children.length == nonNodeElements)) { //this is a leaf
        //console.log("!!!   ---   This Node either had no children at all or it only had links as children!");

        if (!id) {
            id = idBase + idCount++;
        //   node.attr("id", id);
        }

        // node.addClass("editable-field");
        content[id] = node.html();
        // node.html("{{{content." + id + "}}}");
        node.html("{{{" + id + "}}}");
    }
}

//##############################################################################
// getElementsWithContent
function getElementsWithContent(body) {
  var children = body.children();

//   console.log("we have " + children.length + " children!");

  for (var i = 0; i < children.length; i++) {
    if (!$(children[i]).is("script")) {
      checkNode($(children[i]));
    }
  }

}

//##############################################################################
// isSubTagToIgnore
function isSubTagToIgnore(node) {

  for (var i = 0; i < ignoredSubTags.length; i++) {
    if ($(node).is(ignoredSubTags[i])) {
      return true;
    }
  }

  return false;
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