# Task 3
Implement F4: Asset Extraction

## Details
Within the mainprocessmodule we have read the input file.
The next step in the main process is to separate this input file.
We may reuse use code from the dissect-html.js
- use the filename htmlslicer.js - it shall not be in allmodules and therefore shall not have an initialize function
- htmlslicer exports one function "dissect" which returns an object: {htmlOnly, script, style} containing clean writable strings

## Sub-Tasks
- [x] create the htmlslicer stub and use it in the mainprocessmodule.js
- [x] implement the "dissect" function
- [x] write out the script.js and style.css files