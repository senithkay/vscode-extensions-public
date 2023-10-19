/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import path = require("path");

const fs = require('fs');

interface Elements {
    [key: string]: {
        [key: string]: AttributeType
    }
}

interface Attributes {
    [key: string]: AttributeType
}

interface AttributeType {
    type: string | Attributes | undefined,
    name: string,
    isCollection: boolean
}

function getElements(mapping: any): Elements {
    const interfaces: Elements = {};

    // Iterate through elementInfos in the mapping object
    for (const typeInfo of mapping.typeInfos) {
        const elementName = typeInfo.localName;
        const attributes: Attributes = {};

        // Find the corresponding typeInfo for this element
        getAttributes(typeInfo, attributes);
        // Add the element type and its attributes to the result object

        if (typeInfo.baseTypeInfo) {
            attributes.extends = typeInfo.baseTypeInfo.substring(1);
        }

        interfaces[elementName] = attributes;
    }

    return interfaces;

    function getAttributes(typeInfo: any, attributes: { [key: string]: AttributeType }) {
        if (typeInfo) {
            // Check if the typeInfo has propertyInfos (attributes)
            if (typeInfo.propertyInfos) {
                for (const attributeInfo of typeInfo.propertyInfos) {
                    const attributeName = attributeInfo.name;
                    const type = attributeInfo.type;
                    const typeInfo = attributeInfo.typeInfo;
                    const attributeType: AttributeType = { type: undefined, name: attributeName, isCollection: attributeInfo.collection ?? false };

                    if (type === 'attribute') {
                        attributeType.type = typeInfo
                            ? typeInfo.localName ? typeInfo.localName : typeInfo // Use the specified data type from typeInfo
                            : 'string'; // Default to 'string' if typeInfo is not provided

                        if (attributeInfo.attributeName!.localPart) {
                            attributeType.name = attributeInfo.attributeName.localPart;
                        }

                    } else if (type === 'anyAttribute' || type === 'anyElement') {
                        attributeType.type = type;
                    } else if (typeInfo) {
                        attributeType.type = typeInfo.replaceAll(".", "");
                    }

                    if (attributeType.type) attributes[attributeName] = attributeType;
                }
            } else if (typeInfo.type === 'enumInfo') {
                attributes._enum = typeInfo.values;

            }

        }
    }
}

export function generateTSInterfaces() {
    var PO = require('../../generated/PO').PO;

    const tsInterfaces: Elements = getElements(PO);
    const enums: Elements = Object.fromEntries(Object.entries(tsInterfaces).filter(([key, value]) => value._enum !== undefined));

    let enumStr = "";

    let stInterfaces =
        `export interface STNode {
    attributes: STNodeAttributes[]|any;
    children: STNode[];
    end: number;
    endTagOffOffset: number;
    endTagOpenOffset: number;
    hasTextNode: boolean;
    selfClosed: boolean;
    start: number;
    startTagOffOffset: number;
    startTagOpenOffset: number;
    tag: string;
}

export interface STNodeAttributes {
    closed: boolean;
    hasDelimiter: boolean;
    name: string;
    nameTagOffOffset: number;
    nameTagOpenOffset: number;
    originalValue: string
    quotelessValue: string
    valueTagOffOffset: number
    valueTagOpenOffset: number
}\n`;

    let visitor =
        `import * as Synapse from "./syntax-tree-interfaces";
        
export interface Visitor {
    beginVisitSTNode?(node: Synapse.STNode): void;
    endVisitSTNode?(node: Synapse.STNode): void;`;

    // Output TypeScript interfaces
    for (const [interfaceName, attributes] of Object.entries(tsInterfaces)) {

        const capitalizedStr = interfaceName.charAt(0).toUpperCase() + interfaceName.slice(1);
        const TSInterfaceName = capitalizedStr.replaceAll(".", "");

        if (attributes._enum) {
            enumStr += `\nexport enum ${TSInterfaceName} {\n`;
            for (const enumValue of (attributes as any)._enum) {
                enumStr += `${getIndentation(4)}${enumValue},\n`;
            }
            enumStr += `}\n`;
            continue;
        }

        if (attributes.extends) {
            stInterfaces += `\nexport interface ${TSInterfaceName} extends ${attributes.extends}, STNode {\n`;
            delete attributes.extends;
        } else {
            stInterfaces += `\nexport interface ${TSInterfaceName} extends STNode {\n`;
        }

        for (const [attributeName, attributeType] of Object.entries(attributes)) {
            if (!attributeName.startsWith("_")) stInterfaces += parseAttributeType(attributeName, attributeType, enums, "", 4);
        }
        stInterfaces += `}\n`;

        // visitor
        visitor += `\n\n${getIndentation(4)}beginVisit${TSInterfaceName}?(node: Synapse.${TSInterfaceName}): void;`;
        visitor += `\n${getIndentation(4)}endVisit${TSInterfaceName}?(node: Synapse.${TSInterfaceName}): void;`;
    }
    visitor += `\n}\n`;

    fs.writeFileSync(path.join(__dirname, '../../generated/syntax-tree-interfaces.ts'), `${enumStr}\n${stInterfaces}\n`);
    fs.writeFileSync(path.join(__dirname, '../../generated/base-visitor.ts'), `${visitor}`);
    console.log("Generated syntax-tree-interfaces.ts");
}

function parseAttributeType(attributeName: string, attributeType: AttributeType, enums: Elements, str: string, indentation: number): string {
    const indentationStr = getIndentation(indentation);
    const array = attributeType.isCollection ? "[]" : "";

    if (typeof attributeType.type === 'object') {
        str += `${indentationStr}${attributeName}: {\n`;
        for (const [name, type] of Object.entries(attributeType.type)) {
            str = parseAttributeType(name, type, enums, str, indentation + 4);
        }
        str += `${indentationStr}}${array};\n`;
    } else if (typeof attributeType.type === 'string') {
        str += `${indentationStr}${getDataType(attributeName, attributeType, enums)}\n`;
    }
    return str;
}

function getDataType(attributeName: string, attributeType: AttributeType, enums: Elements) {
    const type = attributeType.type as string;
    const name = attributeType.name;
    const array = attributeType.isCollection ? "[]" : "";
    let typeStr = "";

    if (name.includes("_enum_")) {
        const enumName = name.split("_enum_")[1];
        const capitalizedStr = enumName.charAt(0).toUpperCase() + enumName.slice(1);

        if (enums[capitalizedStr]) {
            attributeName = attributeName.replace(`Enum${capitalizedStr}`, "");
            typeStr = capitalizedStr;
        }
    }

    if (!typeStr) {
        switch (type) {
            case type.match("^[aA]ny.*")?.input:
                typeStr = 'any';
                break;

            case 'Boolean':
                typeStr = 'boolean';
                break;

            case 'Int':
            case 'Integer':
            case 'Long':
                typeStr = 'number';
                break;

            case 'NCName':
            case 'QName':
            case 'nyType':
            case 'string':
                typeStr = 'string';
                break;

            default:
                typeStr = type.charAt(0).toUpperCase() + type.slice(1);
        }
    }
    return `${attributeName}: ${typeStr}${array};`;
}

function getIndentation(indentation: number): string {
    let str = "";
    for (let i = 0; i < indentation; i++) {
        str += " ";
    }
    return str;
}

generateTSInterfaces();