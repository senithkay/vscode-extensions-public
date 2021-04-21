import * as fs from "fs";
import {promises as fspromise }  from "fs";
import * as path from "path";
import { resolve } from "path";
import { genFormField, getConnectorList, shutdown } from "./lang-client";
import { Connector } from "./types";

const sdkPath = process.env.BALLERINA_SDK_PATH;
const connectorFilePath = process.env.DEFAULT_CONNECTOR_FILE;

if (!sdkPath) {
    console.log("please define BALLERINA_SDK_PATH");
    process.exit(1);
} else if (!connectorFilePath) {
    console.log("please define DEFAULT_CONNECTOR_FILE(connectors.toml location)");
    process.exit(1); 
}

const cachePath = "../../../connectors/cache";
const connectors: Connector[] = [];
const stFiles: string[] = [];
const notParsedBalFiles: string[] = [];
const usedBalFiles: string[] = [];
const timedOutBalFiles: string[] = [];

async function loadFiles() {
    const connectorsList = await getConnectorList();
    connectorsList.forEach(function(connector: any) {
        connectors.push(connector);
    });
}

loadFiles().then(function(){
    processST();
});


function processST() {
    const syntaxTreePromises: any[] = [];
    connectors.forEach((connector) => {
        stFiles.push(connector.org + "_" + connector.module + "_" + connector.name);
        const promise = genFormField(connector).then((formFields) => {
            console.log("Generating Form field file for " + connector.org + ":" + connector.module + ":"
             + connector.name + ":" + connector.version);
            if (!formFields || formFields.size === 0) {
                // could not parse
                console.log(" Could not parse " + connector.displayName);
                notParsedBalFiles.push(connector.org + "_" + connector.module + "_" + connector.name);
            }
            usedBalFiles.push(connector.displayName);
            const stDirPath = cachePath + "/" + connector.org + "/" + connector.module + "/" + connector.version 
                + "/" + connector.name + "/" + connector.cacheVersion + "/";
            let formFieldObject =  Object.fromEntries(formFields);
            writeSTFile(path.join(__dirname, stDirPath), formFieldObject);
        }).catch((err) => {
            notParsedBalFiles.push(connector.displayName);
            console.log(err);
        });

        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                timedOutBalFiles.push(connector.org + ":" + connector.module + ":" + connector.name + ":" + connector.version);
                resolve(undefined);
                printSummary();
                process.exit(1);
            }, 60000);
        });
        syntaxTreePromises.push(Promise.race([promise, timeout]));
    });
    Promise.all(syntaxTreePromises).then(() => {
        shutdown();
    });
}

function writeSTFile(filePath : string,formFieldObject : any ) {
    fs.exists (filePath, async function (exists) {
        if (exists) {
            await fspromise.writeFile(filePath + "fields.json", JSON.stringify(formFieldObject, null, 2));
            console.log(" File write success : " + filePath + "fields.json");
        } else {
            fs.mkdirSync(filePath);
            await fspromise.writeFile(filePath + "fields.json", JSON.stringify(formFieldObject, null, 2));
            console.log(" File write success : " + filePath + "fields.json");
        }
    });
}

function printSummary() {
    const { log } = console;
    const found = stFiles.length;
    const notParsed = notParsedBalFiles.length;
    const used = usedBalFiles.length;
    const timedOut = timedOutBalFiles.length;

    log(`${found} Connectors found`);
    log(`${notParsed} Could not be parsed`);
    log(`${used} files generated`);
}
