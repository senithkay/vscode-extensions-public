/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

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
    isCollection: boolean
}

function getElements(mapping: any): Elements {
    const interfaces: Elements = {};

    // Iterate through elementInfos in the mapping object
    for (const elementInfo of mapping.elementInfos) {
        const elementName = typeof elementInfo.elementName === 'string' ? elementInfo.elementName : elementInfo.elementName.localPart;
        const attributes: Attributes = {};

        // Find the corresponding typeInfo for this element
        getAttributes(elementInfo.typeInfo, attributes);
        // Add the element type and its attributes to the result object

        interfaces[elementName] = attributes;
    }

    return interfaces;

    function getAttributes(typeName: string, attributes: { [key: string]: AttributeType }) {
        typeName = typeName.substring(1); // Remove the dot prefix
        const typeInfo = mapping.typeInfos.find((info: { localName: any; }) => info.localName === typeName);
        if (typeInfo) {
            // get attributes from base type
            if (typeInfo.baseTypeInfo) {
                getAttributes(typeInfo.baseTypeInfo, attributes);
            }

            // Check if the typeInfo has propertyInfos (attributes)
            if (typeInfo.propertyInfos) {
                for (const attributeInfo of typeInfo.propertyInfos) {
                    const attributeName = attributeInfo.name;
                    let attributeType: AttributeType = { type: undefined, isCollection: attributeInfo.collection ?? false };

                    if (attributeInfo.type === 'attribute') {
                        attributeType.type = attributeInfo.typeInfo
                            ? attributeInfo.typeInfo.localName ? attributeInfo.typeInfo.localName : attributeInfo.typeInfo // Use the specified data type from typeInfo
                            : 'string'; // Default to 'string' if typeInfo is not provided

                    } else if (attributeInfo.type === 'anyAttribute' || attributeInfo.type === 'anyElement') {
                        attributeType.type = attributeInfo.type;
                    } else if (attributeInfo.typeInfo) {
                        const typeInfo = mapping.elementInfos.find((info: { typeInfo: string; }) => info.typeInfo === attributeInfo.typeInfo);
                        if (typeInfo) {
                            attributeType.type = typeInfo.elementName;
                        } else {
                            const attributes: Attributes = {};
                            getAttributes(attributeInfo.typeInfo, attributes);
                            attributeType.type = attributes;
                        }
                    }

                    if (attributeType.type) attributes[attributeName] = attributeType;
                }
            }

        }
    }
}

export function generateTSInterfaces() {
    var PO = require('../../mappings/PO').PO;

    const tsInterfaces: Elements = getElements(PO);

    let stInterfaces =
        `export interface STNode {
    attributes: STNodeAttributes[];
    children: STNode[];
    end: number
    endTagOffOffset: number
    endTagOpenOffset: number
    hasTextNode: boolean
    selfClosed: boolean
    start: number
    startTagOffOffset: number
    startTagOpenOffset: number
    tag: string
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
`export interface Visitor {
    beginVisitSTNode?(node: Synapse.STNode): void;
    endVisitSTNode?(node: Synapse.STNode): void;`;

    // Output TypeScript interfaces
    for (const [interfaceName, attributes] of Object.entries(tsInterfaces)) {

        const capitalizedStr = interfaceName.charAt(0).toUpperCase() + interfaceName.slice(1);
        stInterfaces += `\nexport interface ${capitalizedStr} extends STNode {\n`;
        for (const [attributeName, attributeType] of Object.entries(attributes)) {
            if (!attributeName.startsWith("_")) stInterfaces += parseAttributeType(attributeName, attributeType, "", 4);
        }
        stInterfaces += `}\n`;

        // visitor
        visitor += `\n\n${getIndentation(4)}beginVisit${capitalizedStr}?(node: ${capitalizedStr}): void;\n${getIndentation(4)}endVisit${capitalizedStr}?(node: ${capitalizedStr}): void;`;
    }
    visitor += `\n}`;

    console.log(stInterfaces);
    console.log(visitor);
}

function parseAttributeType(attributeName: string, attributeType: AttributeType, str: string, indentation: number): string {
    const indentationStr = getIndentation(indentation);
    const array = attributeType.isCollection ? "[]" : "";

    if (typeof attributeType.type === 'object') {
        str += `${indentationStr}${attributeName}: {\n`;
        for (const [name, type] of Object.entries(attributeType.type)) {
            str = parseAttributeType(name, type, str, indentation + 4);
        }
        str += `${indentationStr}}${array};\n`;
    } else if (typeof attributeType.type === 'string') {
        str += `${indentationStr}${attributeName}: ${getDataType(attributeType.type)}${array};\n`;
    }
    return str;
}

function getIndentation(indentation: number): string {
    let str = "";
    for (let i = 0; i < indentation; i++) {
        str += " ";
    }
    return str;
}

function getDataType(type: string) {
    switch (type) {
        case 'anyAttribute':
        case 'anyElement':
            return 'any';

        case 'boolean':
            return 'boolean';

        case 'NCName':
        case 'QName':
        case 'string':
            return 'string';

        default:
            return type.charAt(0).toUpperCase() + type.slice(1);
    }
}

generateTSInterfaces();