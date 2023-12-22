/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BalExpression, CodeNodeProperties, Flow, HttpRequestNodeProperties, InputPort, Node, OutputPort, SwitchCaseBlock, SwitchNodeProperties } from "../../rpc-types/webview/types";
import { getComponentSource } from "./template-utils";

const defaultInput = "_ = check <- function;";
let returnBlock : string = "";

export function workerCodeGen(model: Flow): string {
    console.log("===model", model);
    let workerBlocks: string = "";
    // use the util functions and generate the workerblocks
    model?.nodes.forEach(node => {
        if (node.templateId === "SwitchNode") {
            workerBlocks += generateSwitchNode(node);
        } else if (node.templateId === "HttpRequestNode") { 
            workerBlocks += generateCallerNode(node);
        } else if (node.templateId === "HttpResponseNode") {
            workerBlocks += generateResponseNode(node);
        } else {
            workerBlocks += generateBlockNode(node);
        }
    });

    return workerBlocks + returnBlock;
}


function generateBlockNode(node: Node): string {
    const nodeProperties = node.properties as CodeNodeProperties;
    let inputPorts: string = generateInputPorts(node);
    const outputPorts: string = generateOutputPorts(node, nodeProperties?.returnVar)
    console.log("===inputPorts", inputPorts);
    if (inputPorts === undefined && outputPorts !== undefined) {
        inputPorts =  defaultInput;
    }
    const workerNode: string = getComponentSource({
        name: 'CODE_BLOCK_NODE',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: inputPorts,
            CODE_BLOCK: nodeProperties?.codeBlock ? nodeProperties.codeBlock.expression : undefined,
            OUTPUT_PORTS: outputPorts
        }
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${workerNode}
    `;

    return completeNode;
}

function generateSwitchNode(node: Node): string {
    const switchProperties: SwitchNodeProperties = node.properties as SwitchNodeProperties;
    // generate switch case block
    let switchCaseBlock: string = "";
    switchProperties.cases.forEach((switchCase: SwitchCaseBlock) => {
        // check the index of switchCase node
        const index = switchProperties.cases.indexOf(switchCase);

        let outputPorts: string = "";
        switchCase.nodes.forEach(nodeId => {
            // find the port matching the nodeId from outputPorts
            const port = node.outputPorts.find(port => port.id === nodeId);
            if (port) {
                outputPorts += generateOutport(port);
            }
        });

        // check if the switchcase.expression is a string or a bal expression
        let expression: string;
        if (typeof switchCase.expression === 'string') {
            expression = switchCase.expression;
        } else {
            expression = (switchCase.expression as BalExpression).expression;
        }

        if (index === 0) {
            switchCaseBlock += getComponentSource({
                name: 'IF_BLOCK',
                config: {
                    CONDITION: expression,
                    OUTPORTS: outputPorts
                }
            });
        } else {
            switchCaseBlock += getComponentSource({
                name: 'ELSEIF_BLOCK',
                config: {
                    CONDITION: expression,
                    OUTPORTS: outputPorts
                }
            });
        }
    });

    // default case block
        let outputPorts: string = "";
        switchProperties.defaultCase?.nodes.forEach(nodeId => {
            // find the port matching the nodeId from outputPorts
            const port = node.outputPorts.find(port => port.id === nodeId);
            if (port) {
                outputPorts += generateOutport(port);
            }
        });

        switchCaseBlock += getComponentSource({
            name: 'ELSE_BLOCK',
            config: {
                OUTPORTS: outputPorts
            }
        });

    // generate switch node
    const switchNode: string = getComponentSource({
        name: 'SWITCH_NODE',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: generateInputPorts(node),
            SWITCH_BLOCK: switchCaseBlock
        }
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${switchNode}
    `;

    return completeNode;

}

function generateCallerNode(node: Node): string {
    const callerProps = node.properties as HttpRequestNodeProperties;
    const callerEp: string =  callerProps?.endpoint?.name ? callerProps?.endpoint?.name : "grandOakEp"; // TODO : use the value from the model
    const callerVariable: string = node.name + "_response";
    console.log("===callerProps", callerProps);
    const callerAction: string = getComponentSource({
        name: 'CALLER_ACTION',
        config: {
            TYPE: callerProps?.outputType ? callerProps.outputType : "json",
            VARIABLE: callerVariable,
            CALLER: callerEp,
            PATH: callerProps?.path ? removeLeadingSlash(callerProps.path) : undefined,
            ACTION: callerProps?.action ? callerProps.action : "get",
            PAYLOAD: node?.inputPorts[0]?.name ? node.inputPorts[0].name : undefined
        }
    });

    let inputPorts: string = generateInputPorts(node);
    const outputPorts: string = generateOutputPorts(node, callerVariable);
    if (inputPorts === undefined && outputPorts !== undefined) {
        inputPorts =  defaultInput;
    }

    const workerNode: string = getComponentSource({
        name: 'CALLER_BLOCK',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: inputPorts,
            CALLER_ACTION: callerAction,
            OUTPUT_PORTS: outputPorts
        }
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${workerNode}
    `;
    return completeNode;
}

function generateResponseNode(node: Node): string {
    // TODO: current response only suport one inputPort
    const inputPort = node?.inputPorts[0];
    const varType = inputPort?.type ? sanitizeType(inputPort.type): undefined;
    const varName = inputPort?.name;
    const genInport = inputPort ? generateInport(inputPort) : undefined;
    const workerNode: string = getComponentSource({
        name: 'RESPOND',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: genInport ? genInport : undefined,
            VAR_NAME: varName ? varName : undefined
        }
    });

    returnBlock = getComponentSource({
        name: 'RETURN_BLOCK',
        config: {
            NODE_NAME: node.name,
            TYPE: varType ? varType : undefined,
            VAR_NAME: varName ? varName : undefined
        }
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${workerNode}
    `;
    return completeNode;
}


function generateOutport(port: OutputPort, expression?:string): string {
    return getComponentSource({
        name: 'ASYNC_SEND_ACTION',
        config: {
            EXPRESSION: expression ? expression :port?.name,
            TARGET_WORKER: port?.receiver
        }
    });
}

function generateInport(port: InputPort): string {
    return getComponentSource({
        name: 'ASYNC_RECEIVE_ACTION',
        config: {
            TYPE: sanitizeType(port.type),
            VAR_NAME: port.name,
            SENDER_WORKER: port?.sender
        }
    });
}

function generateInputPorts(node: Node): string {
    if (!node.inputPorts || node.inputPorts.length === 0) {
        return undefined;
    }
    let inputPorts: string = "";
    node.inputPorts?.forEach(port => {
        // int x1 = <- A;
        inputPorts += generateInport(port);
    });

    return inputPorts;
}

function generateOutputPorts(node: Node, expression?:string): string {
    if (!node.outputPorts || node.outputPorts.length === 0) {
        return undefined;
    }
    let outputPorts: string = "";
    node.outputPorts?.forEach(port => {
        // x1 -> B;
        if (expression) {
            outputPorts += generateOutport(port, expression);
        } else {
            outputPorts += generateOutport(port);
        }
    });

    return outputPorts;
}


function generateDisplayNode(node: Node): string {
    return getComponentSource({
        name: 'ANNOTATION',
        config: {
            NODE: "Node",
            TEMPLATE_ID: node.templateId,
            X_CODE: node.canvasPosition?.x,
            Y_CODE: node.canvasPosition?.y
        }
    });
}


// TODO: remove once the backend model sends the correct type
function sanitizeType(type: string): string {
    if (type === "$CompilationError$") {
        return "json";
    }
    const typeParts = type.split(":");
    return typeParts[typeParts.length - 1];
}

function removeLeadingSlash(path: string): string {
    if (path.startsWith('/')) {
        return path.substring(1);
    }
    return path;
}
