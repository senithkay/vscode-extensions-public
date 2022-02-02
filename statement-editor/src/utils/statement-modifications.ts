/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

const keywords = [
    "if", "else", "fork", "join", "while", "foreach",
    "in", "return", "returns", "break", "transaction",
    "transactional", "retry", "commit", "rollback", "continue",
    "typeof", "enum", "wait", "check", "checkpanic", "panic",
    "trap", "match", "import", "version", "public", "private",
    "as", "lock", "new", "record", "limit", "start", "flush",
    "untainted", "tainted", "abstract", "external", "final",
    "listener", "remote", "is", "from", "on", "select", "where",
    "annotation", "type", "function", "resource", "service", "worker",
    "object", "client", "const", "let", "source", "parameter", "field",
    "xmlns", "true", "false", "null", "table", "key", "default", "do",
    "base16", "base64", "conflict", "outer", "equals", "boolean", "int",
    "float", "string", "decimal", "handle", "var", "any", "anydata", "byte",
    "future", "typedesc", "map", "json", "xml", "error", "never", "readonly",
    "distinct", "stream"
];

export function createStatement(property: string, targetPosition: NodePosition): STModification {
    const modification: STModification = {
        startLine: targetPosition.startLine,
        startColumn: 0,
        endLine: targetPosition.startLine,
        endColumn: 0,
        type: "INSERT",
        isImport: false,
        config: {
            "STATEMENT": property
        }
    };

    return modification;
}

export function updateStatement(property: string, targetPosition: NodePosition): STModification {
    const modification: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "INSERT",
        isImport: false,
        config: {
            "STATEMENT": property
        }
    };

    return modification;
}

export function createImportStatement(org: string, module: string): STModification {
    const moduleName = module;
    const formattedName = getFormattedModuleName(module);
    let moduleNameStr = org + "/" + module;

    if (moduleName.includes('.') && moduleName.split('.').pop() !== formattedName) {
        // add alias if module name is different with formatted name
        moduleNameStr = org + "/" + module + " as " + formattedName
    }

    const importStatement: STModification = {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0,
        type: "IMPORT",
        config: {
            "TYPE": moduleNameStr
        }
    };

    return importStatement;
}

function getFormattedModuleName(moduleName: string): string {
    let formattedModuleName = moduleName.includes('.') ? moduleName.split('.').pop() : moduleName;
    if (keywords.includes(formattedModuleName)) {
        formattedModuleName = `${formattedModuleName}0`;
    }
    return formattedModuleName;
}
