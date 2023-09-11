/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function extractAttributeType(retrievedType: string) {
    let attributeType = '';

    if (retrievedType) {
        if (retrievedType.includes(':') && retrievedType.includes('|')) {
            const types: string[] = retrievedType.split('|');
            types.forEach((type, index) => {
                attributeType = attributeType + type.slice(type.lastIndexOf(':') + 1);
    
                if (index != types.length - 1) {
                    attributeType = attributeType + '|';
                }
            })
        } else {
            attributeType = retrievedType.slice(retrievedType.lastIndexOf(':') + 1);
        }
    }

    return attributeType;
}

export function getConnectorNameFromId(id: string): string {
    return id.slice(0, id.indexOf(':'));
}
