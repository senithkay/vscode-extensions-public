/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { createElseStatement, createForeachStatement, createIfStatement, createModuleVarDecl, createPropertyStatement, createReturnStatement, createWhileStatement, genVariableName } from "@wso2-enterprise/ballerina-core"


export function constructList() {
    return [{
        title: "Generics",
        description: "",
        items: [
            {
                id: "Variable",
                label: "Variable",
                description: constructMessage.variableStatement.defaultMessage,
                enabled: true,
            },
            {
                id: "Assignment",
                label: "Assignment",
                description: constructMessage.assignmentStatement.defaultMessage,
                enabled: true,
            },
            {
                id: "FunctionCall",
                label: "FunctionCall",
                description: constructMessage.functionCallStatement.defaultMessage,
                enabled: true,
            }
        ]
    },
    {
        title: "Control Flows",
        description: "",
        items: [
            {
                id: "If",
                label: "If",
                description: constructMessage.ifStatement.defaultMessage,
                enabled: true,
            },
            {
                id: "Foreach",
                label: "Foreach",
                description: constructMessage.foreachStatement.defaultMessage,
                enabled: true,
            },
            {
                id: "While",
                label: "While",
                description: constructMessage.whileStatement.defaultMessage,
                enabled: true,
            }
        ]

    },
    {
        title: "Communications",
        description: "",
        items: [
            {
                id: "Return",
                label: "Return",
                description: constructMessage.returnStatement.defaultMessage,
                enabled: true,
            }
        ]
    }]
}

const constructMessage = {
    worker: {
        defaultMessage: "A worker allows to execute code in parallel with function's default worker and other named workers."
    },
    send: {
        defaultMessage: "A send allows to send data from one worker to another."
    },
    receive: {
        defaultMessage: "A receive allows to receive data from other workers."
    },
    wait: {
        defaultMessage: "A wait allows worker to wait for another worker and get the return value of it."
    },
    flush: {
        defaultMessage: "A flush allows the worker to wait until all the send messages are consumed by the target workers."
    },
    variableStatement: {
        defaultMessage: "A variable statement holds the value of a specific data type (string, integer, etc.) so that it can be used later in the logical process of the service or integration."
    },
    assignmentStatement: {
        defaultMessage: "An assignment statement lets you to assign a value to a variable that is already defined"
    },
    ifStatement: {
        defaultMessage: "An if statement lets you specify two blocks of logical components so that the system can decide which block to execute based on whether the provided condition is true or false."
    },
    foreachStatement: {
        defaultMessage: "A foreach statement is a control flow statement that can be used to iterate over a list of items.",
    },
    whileStatement: {
        defaultMessage: "A while statement executes a block of statements in a loop as long as the specified condition is true."
    },
    returnStatement: {
        defaultMessage: "A return statement stops executing the current path or returns a value back to the caller."
    },
    respondStatement: {
        defaultMessage: "A respond statement sends the response from a service back to the client."
    },
    customStatement: {
        defaultMessage: "A custom statement can be used to write a single or a multiline code snippet that is not supported by the low code diagram."
    },
    httpConnectorStatement: {
        defaultMessage: "An HTTP connector can be used to integrate with external applications."
    },
    dataMapperStatement: {
        defaultMessage: "A data mapping statement can be used to create an object using several other variables."
    },
    connectorStatement: {
        defaultMessage: "A connector can be used to integrate with external applications."
    },
    actionStatement: {
        defaultMessage: "An action can be used to invoke operations of an existing connector."
    },
    functionCallStatement: {
        defaultMessage: "A function call is a request that performs a predetermined function."
    }
}

export function getTemplateValues(nodeType: string, allVariables: string[]) {
    switch (nodeType) {
        case "Variable":
            return createModuleVarDecl(
                {
                    varName: genVariableName("variable", allVariables),
                    varOptions: [],
                    varType: "var",
                    varValue: "EXPRESSION"
                }
            );
        case "Assignment":
            return createPropertyStatement(
                `default =  EXPRESSION;`
            );

        case "FunctionCall":
            return createPropertyStatement(
                `FUNCTION_CALL() ;`
            );

        case "Foreach":
            return createForeachStatement(
                'EXPRESSION',
                'item',
                'var'
            );
        case "While":
            return createWhileStatement(
                'EXPRESSION'
            );
        case "Return":
            return createReturnStatement(
                'EXPRESSION'
            );
        case "IfStatement":
            return createIfStatement(
                'EXPRESSION'
            );
        case "ElseStatement":
            return createElseStatement();
        default:
            // handle other cases here
            break;
    }
}