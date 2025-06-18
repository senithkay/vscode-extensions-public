/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export function getReferencedName(importStatement: string): string {
    // Remove the 'import' keyword and semicolon
    const cleanImport = importStatement.replace('import ', '').replace(';', '');
    
    // Check if the import has an alias (contains 'as')
    if (cleanImport.includes(' as ')) {
        // Split by 'as' and return the alias (trimmed)
        return cleanImport.split(' as ')[1].trim();
    }
    
    // For imports without alias, get the last part of the path
    const parts = cleanImport.split('/');
    const lastPart = parts[parts.length - 1];
    
    // Return the last part of the path
    const dotParts = lastPart.split('.');
    return dotParts[dotParts.length - 1];
}

export function createImportReferenceMap(importStatements: string[]): Record<string, string> {
    const referenceMap: Record<string, string> = {};
    
    for (const importStatement of importStatements) {
        const referencedName = getReferencedName(importStatement);
        referenceMap[importStatement] = referencedName;
    }
    
    return referenceMap;
}
