const tsMorph = require("ts-morph");
const fs = require("fs");
const path = require("path");


// Path to the TypeScript file
let tsFilePath = "";

const argument = process.env.npm_config_path || tsFilePath;
if (argument) {
    const tsFileDirPath = path.resolve(__dirname, `../ballerina-core/src/rpc-types/${argument}`);
    tsFilePath = tsFileDirPath;
} else {
    console.log("No path provided for ballerina-core rpc-type. You can pass the path like below.");
    console.log("npm run generate --path=overview/index.ts");
    return;
}

console.log("Generating related typescript files. Please wait...");

const headerComment = `/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
`
// Define the tsMorph project
const project = new tsMorph.Project();

// Get the directory name from the path to the TypeScript file
const dirName = path.basename(path.dirname(tsFilePath));

let sourceFile;
try {
    // Create a ts-morph Project
    sourceFile = project.addSourceFileAtPath(tsFilePath);
} catch (error) {
    console.log("Error: File not found. Please check the file path");
    return;
}

// Get the first/only interface
const myInterface = sourceFile.getInterfaces()[0];

// Get the properties of the interface
const properties = myInterface.getProperties();

// Define all the types that needs to be imported
const definedTypes = [myInterface.getName()];
const returnTypes = [];

const methodNames = [];

const typescriptTypes = [
    "string",
    "number",
    "boolean",
    "null",
    "undefined",
    "any",
    "void",
    "never",
    "unknown",
    "object",
    "Array",
    "Tuple",
    "Enum",
    "Interface",
    "Type alias",
    "Union",
    "Intersection",
    "Literal",
    "Nullable",
    "Optional",
    "Readonly",
    "Partial",
    "Pick",
    "Omit",
    "Keyof"
];

const words = dirName.split('-');
const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
const componentName = capitalizedWords.join('');

// Generate the body implementation
let typeImport = `${headerComment}
import { RequestType } from "vscode-messenger-common";
`;
let typeBody = ``;

let preFix = `_${dirName}`;
let preFixConst = `
const ${preFix} = "${dirName}";`


let eventImport = '';
let eventEmitter = '';
let eventVariable = '';
let classBody = '';

let handlerImport = 'import { Messenger } from "vscode-messenger";\n';
let handlerBody = '';

let clientImport = 'import { HOST_EXTENSION } from "vscode-messenger-common";';
let clientBody = '';

properties.forEach(property => {
    const propertyText = property.getText();
    let signature = property.getTypeNode().getText().replace(/\s/g, '').replace("=>", " => ");

    const name = property.getName();
    console.log(`Creating... ${name} method`);
    let haveArgs = false;
    let isNotification = false;
    // Extract the type name using regular expressions
    const matchedTypes = signature.match(/(?<=:\s*)([A-Za-z][A-Za-z0-9]*)/);
    const typeName = matchedTypes && matchedTypes.length > 0 && matchedTypes[0];

    // Extract the response type using regular expressions
    const matchedRetuns = signature.match(/(?<=Promise<)(.*?)(?=>)/);
    let returnType = matchedRetuns && matchedRetuns.length > 0 && matchedRetuns[0];

    const isVariable = !propertyText.includes("(");
    const isEvent = propertyText.includes("Event");

    if (isEvent) {
        // Use regular expressions to extract the event type
        const regex = /(\w+):\s*Event<([^>]+)>;/;
        const match = propertyText.match(regex);

        if (match) {
            returnType = match[2];
        }
    }


    if (typeName) {
        const trimmedType = typeName.replace(/\[|\]/g, "").trim();
        if (!typescriptTypes.includes(trimmedType) && !definedTypes.includes(trimmedType)) {
            definedTypes.push(trimmedType);
            returnTypes.push(trimmedType);
            haveArgs = true;
        }
    }

    if (returnType) {
        const trimmedReturn = returnType.replace(/\[|\]/g, "").trim();
        if (!typescriptTypes.includes(returnType) && !definedTypes.includes(trimmedReturn)) {
            definedTypes.push(trimmedReturn);
        }
        if (returnType === "void") {
            isNotification = true;
        }
    }

    let getName = ``;
    if (isVariable) {
        getName = `get ${name}(): `;
    }

    const prefixMethod = "`${" + preFix + "}/" + name + "`";

    // isEvent means for notifications
    if (isEvent) {
        // Manager file related content
        eventImport = `import { EventEmitter } from 'vscode';`;
        eventEmitter += `
    private _${name} = new EventEmitter<${returnType}>();`;
        eventVariable += `
    public readonly ${name} = this._${name}.event;`;

        // Handler file related content
        handlerBody += `\trpcManger.${name}((args: ${typeName}) => messenger.sendNotification(${name}, BROADCAST ,args));\n`;
        handlerImport += `import { BROADCAST } from "vscode-messenger-common";`

        // Client file related content
        clientImport = 'import { HOST_EXTENSION, NotificationHandler } from "vscode-messenger-common";';
        clientBody += `
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ${name}(callback: NotificationHandler<${returnType}>): any {
        this._messenger.onNotification(${name}, callback);
        return {};
    }
    `;

        // Type file related content
        typeImport = `${headerComment}
import { RequestType, NotificationType } from "vscode-messenger-common";
    `;
        typeBody += `
export const ${name}: NotificationType<${returnType}> = { method: ${prefixMethod} };`;

    } else {
        // Manager file related content
        classBody += `
    ${isVariable ? getName : name}${signature.replace(" =>", ":")} {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error("Not implemented");
    }
    `;

        // Handler file related content
        const handlerType = isNotification ? "onNotification" : "onRequest";
        handlerBody += `\tmessenger.${handlerType}(${name}, (${haveArgs ? 'args: ' + typeName : ''}) => rpcManger.${name}${isVariable ? '' : `(${haveArgs ? 'args' : ''})`});\n`;


        // Client file related content
        const clientType = isNotification ? "sendNotification" : "sendRequest";

        const messageType = isNotification ? "NotificationType" : "RequestType";

        clientBody += `
    ${isVariable ? getName : name}${signature.replace(" =>", ":")} {
        return this._messenger.${clientType}(${name}, HOST_EXTENSION${haveArgs ? ', params' : ''})
    }
    `;

        // Type file related content
        typeBody += `
export const ${name}: ${messageType}<${typeName ? typeName : 'void'}, ${returnType}> = { method: ${prefixMethod} };`;
    }

    methodNames.push(name);
});


// Class name //OverviewRPCManger
const className = `${componentName}RpcManger`;
const handlerName = `register${componentName}RpcHandlers`;
const clientName = `${componentName}RpcClient`;

// Generate the class implementation
let rpcMangerCode = `${headerComment}
${eventImport}
import { \n${definedTypes.sort().map((type, index, array) => index === array.length - 1 ? '\t' + type : '\t' + type + ',\n').join('')} \n} from "@wso2-enterprise/ballerina-core";

export class ${className} implements ${myInterface.getName()} {
${eventEmitter}
${eventVariable}
${classBody}
}
`;

// Generate the handler implementation
let handlerCode = `${headerComment}
${handlerImport}
import { ${className} } from "./rpc-manager";
import { \n${methodNames.concat(returnTypes).sort().map((type, index, array) => index === array.length - 1 ? '\t' + type : '\t' + type + ',\n').join('')} \n} from "@wso2-enterprise/ballerina-core";

export function ${handlerName}(messenger: Messenger) {
    const rpcManger = new ${className}();
${handlerBody}
}
`;

// Generate the client implementation
let clientCode = `${headerComment}
${clientImport}
import { Messenger } from "vscode-messenger-webview";
import { \n${methodNames.concat(definedTypes).sort().map((type, index, array) => index === array.length - 1 ? '\t' + type : '\t' + type + ',\n').join('')} \n} from "@wso2-enterprise/ballerina-core";

export class ${clientName} implements ${myInterface.getName()} {

    private _messenger: Messenger;
    constructor(messenger: Messenger) {
        this._messenger = messenger;
    }
${clientBody}
}
`;

console.log(`Done!`);


sourceFile.getImportDeclarations()[0].getText();

let importDeclarations = '';
sourceFile.getImportDeclarations().forEach(statement => {
    importDeclarations += `${statement.getText()}\n`;
})

// Generate the rpc-type implementation
const rpcTypeCode = `${typeImport}
${importDeclarations}
// EXPORT THIS FILE FROM ROOT INDEX
${preFixConst}
${typeBody}
`;

// Create the directory if it doesn't exist
const rpcTypeDir = path.resolve(__dirname, `../ballerina-core/src/rpc-types/${dirName}`);
if (!fs.existsSync(rpcTypeDir)) {
    fs.mkdirSync(rpcTypeDir);
}
// rpc-types should go to ballerina-extension/src/rpc-managers
fs.writeFileSync(path.resolve(rpcTypeDir, 'rpc-type.ts'), rpcTypeCode);


// Create the directory if it doesn't exist
const rpcMangerDir = path.resolve(__dirname, `../ballerina-extension/src/rpc-managers/${dirName}`);
if (!fs.existsSync(rpcMangerDir)) {
    fs.mkdirSync(rpcMangerDir);
    // rpc-manager & rpc-handler should go to ballerina-extension/src/rpc-managers
    fs.writeFileSync(path.resolve(rpcMangerDir, 'rpc-manager.ts'), rpcMangerCode);
}
fs.writeFileSync(path.resolve(rpcMangerDir, 'rpc-handler.ts'), handlerCode);


// Create the directory if it doesn't exist
const rpcClientDir = path.resolve(__dirname, `../ballerina-rpc-client/src/rpc-clients/${dirName}`);
if (!fs.existsSync(rpcClientDir)) {
    fs.mkdirSync(rpcClientDir);
}
// rpc-client should go to ballerina-rpc-client/src/rpc-clients
fs.writeFileSync(path.resolve(rpcClientDir, 'rpc-client.ts'), clientCode);