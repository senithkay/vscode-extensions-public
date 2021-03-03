/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { FormField } from "../../ConfigurationSpec/types";
import { STModification } from "../../Definitions/lang-client-extended";
import { HeaderObjectConfig } from "../components/ConnectorExtensions/HTTPWizard/HTTPHeaders";
import { getParams } from "../components/Portals/utils";
import { DraftInsertPosition, DraftUpdateStatement } from "../view-state/draft";

export function createIfStatement(conditionExpression: string, targetPosition: DraftInsertPosition): STModification {
    const ifStatement: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "IF_STATEMENT",
        config: {
            "CONDITION": conditionExpression,
        }
    };

    return ifStatement;
}

export function updateIfStatementCondition(conditionExpression: string, targetPosition: DraftUpdateStatement): STModification {
    const updatedIfStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "IF_STATEMENT_CONDITION",
        config: {
            "CONDITION": conditionExpression,
        }
    };

    return updatedIfStatement;
}

export function createForeachStatement(collection: string, variableName: string, targetPosition: DraftInsertPosition): STModification {
    const foreachStatement: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "FOREACH_STATEMENT",
        config: {
            "COLLECTION": collection,
            "TYPE": "var",
            "VARIABLE": variableName
        }
    };

    return foreachStatement;
}

export function updateForEachCondition(collection: string, variableName: string, targetPosition: DraftUpdateStatement): STModification {
    const foreachStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "FOREACH_STATEMENT_CONDITION",
        config: {
            "COLLECTION": collection,
            "VARIABLE": variableName
        }
    };

    return foreachStatement;
}


export function createPropertyStatement(property: string, targetPosition: DraftInsertPosition): STModification {
    const propertyStatement: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "PROPERTY_STATEMENT",
        config: {
            "PROPERTY": property,
        }
    };

    return propertyStatement;
}

export function updatePropertyStatement(property: string, targetPosition: DraftUpdateStatement): STModification {
    const propertyStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "PROPERTY_STATEMENT",
        config: {
            "PROPERTY": property,
        }
    };

    return propertyStatement;
}

export function createLogStatement(type: string, logExpr: string, targetPosition: DraftInsertPosition): STModification {
    const propertyStatement: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "LOG_STATEMENT",
        config: {
            "TYPE": type,
            "LOG_EXPR": logExpr
        }
    };

    return propertyStatement;
}

export function updateLogStatement(type: string, logExpr: string, targetPosition: DraftUpdateStatement): STModification {
    const propertyStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "LOG_STATEMENT",
        config: {
            "TYPE": type,
            "LOG_EXPR": logExpr
        }
    };

    return propertyStatement;
}

export function createReturnStatement(returnExpr: string, targetPosition: DraftInsertPosition): STModification {
    const returnStatement: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "RETURN_STATEMENT",
        config: {
            "RETURN_EXPR": returnExpr
        }
    };

    return returnStatement;
}

export function updateReturnStatement(returnExpr: string, targetPosition: DraftUpdateStatement): STModification {
    const returnStatement: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "RETURN_STATEMENT",
        config: {
            "RETURN_EXPR": returnExpr
        }
    };

    return returnStatement;
}

export function createImportStatement(org: string, module: string, targetPosition: DraftInsertPosition): STModification {
    const importStatement: STModification = {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0,
        type: "IMPORT",
        config: {
            "TYPE": org + "/" + module
        }
    };

    return importStatement;
}

export function createObjectDeclaration(type: string, variableName: string, params: string[], targetPosition: DraftInsertPosition): STModification {
    const objectDeclaration: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "DECLARATION",
        config: {
            "TYPE": type,
            "VARIABLE": variableName,
            "PARAMS": params
        }
    };
    return objectDeclaration;
}

export function updateObjectDeclaration(type: string, variableName: string, params: string[], targetPosition: DraftUpdateStatement): STModification {
    const objectDeclaration: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "DECLARATION",
        config: {
            "TYPE": type,
            "VARIABLE": variableName,
            "PARAMS": params
        }
    };
    return objectDeclaration;
}

export function createRemoteServiceCall(type: string, variable: string, callerName: string, functionName: string, params: string[], targetPosition: DraftInsertPosition): STModification {
    const remoteServiceCall: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "REMOTE_SERVICE_CALL",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "CALLER": callerName,
            "FUNCTION": functionName,
            "PARAMS": params
        }
    };

    return remoteServiceCall;
}

export function createCheckedRemoteServiceCall(type: string, variable: string, callerName: string, functionName: string, params: string[], targetPosition: DraftInsertPosition): STModification {
    const checkedRemoteServiceCall: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "REMOTE_SERVICE_CALL_CHECK",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "CALLER": callerName,
            "FUNCTION": functionName,
            "PARAMS": params
        }
    };

    return checkedRemoteServiceCall;
}

export function updateCheckedRemoteServiceCall(type: string, variable: string, callerName: string, functionName: string, params: string[], targetPosition: DraftUpdateStatement): STModification {
    const checkedRemoteServiceCall: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "REMOTE_SERVICE_CALL_CHECK",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "CALLER": callerName,
            "FUNCTION": functionName,
            "PARAMS": params
        }
    };

    return checkedRemoteServiceCall;
}

export function createServiceCallForPayload(type: string, variable: string, callerName: string, functionName: string, params: string[], targetPosition: DraftInsertPosition): STModification {
    let statement = "http:Response $varName = <http:Response>checkpanic $callerName->$functionName($parameters);";
    statement = statement
        .replace("$parameters", params.toString())
        .replace("$varName", variable)
        .replace("$callerName", callerName)
        .replace("$functionName", functionName);
    const modification: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "PROPERTY_STATEMENT",
        config: {
            "PROPERTY": statement,
        }
    }
    return modification;
}

export function updateServiceCallForPayload(type: string, variable: string, callerName: string, functionName: string, params: string[], targetPosition: DraftUpdateStatement): STModification {
    let statement = "http:Response $varName = <http:Response>checkpanic $callerName->$functionName($parameters);";
    statement = statement
        .replace("$parameters", params.toString())
        .replace("$varName", variable)
        .replace("$callerName", callerName)
        .replace("$functionName", functionName);
    const modification: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "PROPERTY_STATEMENT",
        config: {
            "PROPERTY": statement,
        }
    }
    return modification;
}

export function createRespond(type: string, variable: string, callerName: string, expression: string, targetPosition: DraftInsertPosition): STModification {
    const respond: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "RESPOND",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "CALLER": callerName,
            "EXPRESSION": expression
        }
    };

    return respond;
}

export function createCheckedRespond(callerName: string, expression: string, targetPosition: DraftInsertPosition): STModification {
    const checkedRespond: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "RESPOND_WITH_CHECK",
        config: {
            "CALLER": callerName,
            "EXPRESSION": expression
        }
    };

    return checkedRespond;
}

export function updateCheckedRespond(callerName: string, expression: string, targetPosition: DraftUpdateStatement): STModification {
    const checkedRespond: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "RESPOND_WITH_CHECK",
        config: {
            "CALLER": callerName,
            "EXPRESSION": expression
        }
    };

    return checkedRespond;
}

export function createTypeGuard(variable: string, type: string, statement: string, targetPosition: DraftInsertPosition): STModification {
    const typeGuard: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "TYPE_GUARD_IF",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "STATEMENT": statement
        }
    };

    return typeGuard;
}

export function createCheckedPayloadFunctionInvocation(variable: string, type: string, response: string, payload: string, targetPosition: DraftInsertPosition): STModification {
    const checkedPayloadInvo: STModification = {
        startLine: targetPosition.line,
        startColumn: 0,
        endLine: targetPosition.line,
        endColumn: 0,
        type: "CHECKED_PAYLOAD_FUNCTION_INVOCATION",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "RESPONSE": response,
            "PAYLOAD": payload
        }
    };

    return checkedPayloadInvo;
}

export function updateCheckedPayloadFunctionInvocation(variable: string, type: string, response: string, payload: string, targetPosition: DraftUpdateStatement): STModification {
    const checkedPayloadInvo: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "CHECKED_PAYLOAD_FUNCTION_INVOCATION",
        config: {
            "TYPE": type,
            "VARIABLE": variable,
            "RESPONSE": response,
            "PAYLOAD": payload
        }
    };

    return checkedPayloadInvo;
}

export function removeStatement(targetPosition: DraftUpdateStatement): STModification {
    const removeLine: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: 'DELETE'
    }

    return removeLine;
}

export function createHeaderObjectDeclaration(headerObject: HeaderObjectConfig[], requestName: string, operation: string,
                                              message: FormField, targetPosition: DraftInsertPosition, modifications: STModification[]) {
    if (operation !== "forward") {
        let httpRequest: string = "http:Request ";
        httpRequest += requestName;
        httpRequest += " = new;";
        if (operation === "post" || operation === "put" || operation === "delete" || operation === "patch") {
            const payload: string = "\n" + requestName + ".setPayload(" + getParams([message]).toString() + ");";
            httpRequest += payload;
        }
        const requestGeneration: STModification = {
            startLine: targetPosition.line,
            startColumn: 0,
            endLine: targetPosition.line,
            endColumn: 0,
            type: "PROPERTY_STATEMENT",
            config: {
                "PROPERTY": httpRequest,
            }
        };
        modifications.push(requestGeneration);
    }

    headerObject.forEach((header) => {
        let headerStmt: string = ("$requestName.setHeader(\"$key\", \"$value\");").replace("$requestName", requestName);
        headerStmt = headerStmt.replace("$key", header.objectKey);
        headerStmt = headerStmt.replace("$value", header.objectValue);
        const headerObjectDeclaration: STModification = {
            startLine: targetPosition.line,
            startColumn: 0,
            endLine: targetPosition.line,
            endColumn: 0,
            type: "PROPERTY_STATEMENT",
            config: {
                "PROPERTY": headerStmt,
            }
        };
        modifications.push(headerObjectDeclaration);
    });
}

export function updateHeaderObjectDeclaration(headerObject: HeaderObjectConfig[], requestName: string, operation: string,
                                              message: FormField, targetPosition: DraftUpdateStatement): STModification {
    let headerDecl: string = "";
    if (operation !== "forward") {
        if (operation === "post" || operation === "put" || operation === "delete" || operation === "patch") {
            const payload: string = requestName + ".setPayload(" + getParams([message]).toString() + ");";
            headerDecl += payload;
        }

    }

    headerObject.forEach((header) => {
        let headerStmt: string = ("$requestName.setHeader($key, $value);\n").replace("$requestName", requestName);
        const regexExp = /"(.*?)"/g
        headerStmt = headerStmt.replace("$key", header.objectKey.match(regexExp) ? header.objectKey : `"${header.objectKey}"`);
        headerStmt = headerStmt.replace("$value", header.objectValue.match(regexExp) ? header.objectValue : `"${header.objectValue}"`);
        headerDecl += headerStmt;
    });

    const requestGeneration: STModification = {
        startLine: targetPosition.startLine,
        startColumn: targetPosition.startColumn,
        endLine: targetPosition.endLine,
        endColumn: targetPosition.endColumn,
        type: "PROPERTY_STATEMENT",
        config: {
            "PROPERTY": headerDecl,
        }
    };

    return requestGeneration;
}
