/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import {
    BalExpression,
    CodeNodeProperties,
    Flow,
    HttpRequestNodeProperties,
    InputPort,
    Node,
    OutputPort,
    SwitchCaseBlock,
    SwitchNodeProperties,
    TransformNodeProperties,
} from "../../rpc-types/webview/types";
import { getNodeMetadata } from "./metadata-utils";
import { getComponentSource } from "./template-utils";

// const defaultInput = "_ = check <- function;";
let returnBlock: string = "";
let startWorkerCall: string = "";

interface TransformNodeData {
    transformNode: string;
    transformFunction?: string;
}

export interface CodeGeneartionData {
    workerBlocks: string;
    transformFunction?: string;
}
// Generate new code to update the Flow model
// Insert your code here

export function workerCodeGen(model: Flow): CodeGeneartionData {
    console.log("===model", model);
    let workerBlocks: string = "";
    let transformFunction: string;
    // use the util functions and generate the workerblocks
    model?.nodes.forEach((node) => {
        if (node.templateId === "SwitchNode") {
            workerBlocks += generateSwitchNode(node);
        } else if (node.templateId === "HttpRequestNode") {
            workerBlocks += generateCallerNode(node);
        } else if (node.templateId === "HttpResponseNode") {
            workerBlocks += generateResponseNode(node);
        } else if (node.templateId === "TransformNode") {
            const transformNodeData: TransformNodeData = generateTransformNode(node);
            transformFunction = transformNodeData.transformFunction;
            workerBlocks += transformNodeData.transformNode;
        } else if (node.templateId === "StartNode") {
            workerBlocks += generateStartNode(node);
        } else {
            workerBlocks += generateBlockNode(node);
        }
    });

    // TODO: refactor
    if (transformFunction) {
        return {
            workerBlocks: workerBlocks + startWorkerCall + returnBlock,
            transformFunction: transformFunction,
        };
    } else {
        return {
            workerBlocks: workerBlocks + startWorkerCall + returnBlock,
        };
    }
}

function generateStartNode(node: Node): string {
    const startNode: string = getComponentSource({
        name: "START_NODE",
        config: {
            OUTPUT_PORTS: generateOutputPorts(node, "()"),
        },
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${startNode}
    `;

    // TODO: Add as template
    startWorkerCall = `
    () -> StartNode;
    `;

    return completeNode;
}

function generateBlockNode(node: Node): string {
    const nodeProperties = node.properties as CodeNodeProperties;
    const inputPorts: string = generateInputPorts(node);
    const outputPorts: string = generateOutputPorts(node);
    console.log("===inputPorts", inputPorts);
    // if (inputPorts === undefined && outputPorts !== undefined) {
    //     inputPorts = defaultInput;
    // }
    const workerNode: string = getComponentSource({
        name: "CODE_BLOCK_NODE",
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: inputPorts,
            CODE_BLOCK: nodeProperties?.codeBlock ? nodeProperties.codeBlock.expression : undefined,
            OUTPUT_PORTS: outputPorts,
        },
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
    const inputVar = node?.inputPorts.length > 0 ? node.inputPorts[0]?.name : "()";
    // generate switch case block
    let switchCaseBlock: string = "";
    switchProperties.cases.forEach((switchCase: SwitchCaseBlock) => {
        // check the index of switchCase node
        const index = switchProperties.cases.indexOf(switchCase);

        let outputPorts: string = "";
        switchCase.nodes.forEach((nodeId) => {
            // find the port matching the nodeId from outputPorts
            const port = node.outputPorts.find((port) => port.id === nodeId);
            if (port) {
                outputPorts += generateOutport(port, inputVar);
            }
        });

        // check if the switchcase.expression is a string or a bal expression
        let expression: string;
        if (typeof switchCase.expression === "string") {
            expression = switchCase.expression;
        } else {
            expression = (switchCase.expression as BalExpression).expression;
        }

        if (index === 0) {
            switchCaseBlock += getComponentSource({
                name: "IF_BLOCK",
                config: {
                    CONDITION: expression,
                    OUTPORTS: outputPorts,
                },
            });
        } else {
            switchCaseBlock += getComponentSource({
                name: "ELSEIF_BLOCK",
                config: {
                    CONDITION: expression,
                    OUTPORTS: outputPorts,
                },
            });
        }
    });

    // default case block
    let outputPorts: string = "";
    switchProperties.defaultCase?.nodes.forEach((nodeId) => {
        // find the port matching the nodeId from outputPorts
        const port = node.outputPorts.find((port) => port.id === nodeId);
        if (port) {
            outputPorts += generateOutport(port, inputVar);
        }
    });

    switchCaseBlock += getComponentSource({
        name: "ELSE_BLOCK",
        config: {
            OUTPORTS: outputPorts,
        },
    });

    // generate switch node
    const switchNode: string = getComponentSource({
        name: "SWITCH_NODE",
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: generateInputPorts(node),
            SWITCH_BLOCK: switchCaseBlock,
        },
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
    const callerEp: string = callerProps?.endpoint?.name ? callerProps?.endpoint?.name : "grandOakEp"; // TODO : use the value from the model
    const callerVariable: string = node.name.toLowerCase() + "_response";
    
    const callerAction: string = getComponentSource({
        name: "CALLER_ACTION",
        config: {
            TYPE: callerProps?.outputType ? callerProps.outputType : "json",
            VARIABLE: callerVariable,
            CALLER: callerEp,
            PATH: callerProps?.path ? removeLeadingSlash(callerProps.path) : undefined,
            ACTION: callerProps?.action ? callerProps.action : "get",
            PAYLOAD:
                callerProps.action === "post"
                    ? node?.inputPorts[0]?.name
                        ? node.inputPorts[0].name
                        : "{}"
                    : undefined,
        },
    });

    const inputPorts: string = generateInputPorts(node);
    const outputPorts: string = generateOutputPorts(node, callerVariable);
    // if (inputPorts === undefined && outputPorts !== undefined) {
    //     inputPorts = defaultInput;
    // }

    const workerNode: string = getComponentSource({
        name: "CALLER_BLOCK",
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: inputPorts,
            CALLER_ACTION: callerAction,
            OUTPUT_PORTS: outputPorts,
        },
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
    const varType = inputPort?.type ? sanitizeType(inputPort.type) : undefined;
    const varName = inputPort?.name;

    // TODO: fix the correct type and name when there aremultiple types of the input ports
    let genInport;

    if (node.inputPorts?.length > 1) {
        const responseList = generateAlternateResponse(node);
        genInport = getComponentSource({
            name: "ASYNC_RECEIVE_ACTION",
            config: {
                TYPE: varType,
                VAR_NAME: varName,
                SENDER_WORKER: responseList,
            },
        });
    } else {
        genInport = inputPort ? generateInport(inputPort) : undefined;
    }

    const workerNode: string = getComponentSource({
        name: "RESPOND",
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: genInport ? genInport : undefined,
            VAR_NAME: varName ? varName : undefined,
        },
    });

    returnBlock = getComponentSource({
        name: "RETURN_BLOCK",
        config: {
            NODE_NAME: node.name,
            TYPE: varType ? varType : undefined,
            VAR_NAME: varName ? varName : undefined,
        },
    });

    // node with annotation
    const completeNode = `
    ${generateDisplayNode(node)}
    ${workerNode}
    `;
    return completeNode;
}

// TODO: Add template for alterate worker check
function generateAlternateResponse(node: Node): string {
    // get the inputPorts list and get the receiver name and generate in the form of receiverName1 | recieverName1
    let inputPorts = "";
    node.inputPorts.forEach((port: InputPort) => {
        const receiver = port.sender;
        inputPorts += receiver;
        // if the receiver is not the last element add a comma
        if (node.inputPorts.indexOf(port) !== node.inputPorts.length - 1) {
            inputPorts += " | ";
        }
    });
    return inputPorts;
}

function generateTransformNode(node: Node): TransformNodeData {
    const nodeProperties = node.properties as TransformNodeProperties;
    const inputPorts: string = generateInputPorts(node);
    const outputVar: string = node.name.toLowerCase() + "_transformed";
    const outputPorts: string = generateOutputPorts(node, outputVar);
    
    // create the transform_Function
    if (!nodeProperties?.expression?.expression) {
        // get metadata
        const metadata = getNodeMetadata(node);
        const outputType = metadata?.outputs[0]?.type;
        const inputPortNames: string[] = [];
        metadata?.inputs.forEach((input) => {
            inputPortNames.push(input.name);
        });

        const inputPortTypes: string[] = [];
        metadata?.inputs.forEach((input) => {
            inputPortTypes.push(input.type);
        });

        // generate a comma separated string with inputPortTypes and inputPortNames with same index by taking as one construct
        const functionParams = inputPortTypes
            .map((type, index) => {
                return type + " " + inputPortNames[index];
            })
            .join(", ");

        const parameters = inputPortNames.join(", ");
        // TODO: move to templates
        const returnString = "returns " + outputType + "|error";

        const transFunName = (node.name + "_transform").toLocaleLowerCase();
        const transFunction = getComponentSource({
            name: "TRANSFORM_FUNCTION",
            config: {
                FUNCTION_NAME: transFunName,
                PARAMETERS: functionParams,
                RETURN: returnString,
            },
        });
        // TODO: move as template
        const transFuncSignature = transFunName + "(" + parameters + ");";

        // generate the function call to transform function
        const returnType = nodeProperties?.outputType ? nodeProperties.outputType : outputType;
        const transformCall = returnType + " " + outputVar + " = check " + transFuncSignature;

        // generate the worker node
        const workerNode: string = getComponentSource({
            name: "TRANSFORM_NODE",
            config: {
                NODE_NAME: node.name,
                INPUT_PORTS: inputPorts,
                TRANSFORM_FUNCTION: transformCall,
                OUTPUT_PORTS: outputPorts,
            },
        });

        // node with annotation
        const completeNode = `
            ${generateDisplayNode(node)}
            ${workerNode}
            `;

        return {
            transformFunction: transFunction,
            transformNode: completeNode,
        };
    } else {
        const workerNode: string = getComponentSource({
            name: "TRANSFORM_NODE",
            config: {
                NODE_NAME: node.name,
                INPUT_PORTS: inputPorts,
                TRANSFORM_FUNCTION: nodeProperties.expression?.expression,
                OUTPUT_PORTS: outputPorts,
            },
        });

        const completeNode = `
            ${generateDisplayNode(node)}
            ${workerNode}
            `;

        return {
            transformNode: completeNode,
        };
    }
}

function generateOutport(port: OutputPort, expression?: string): string {
    return getComponentSource({
        name: "ASYNC_SEND_ACTION",
        config: {
            EXPRESSION: expression ? expression : port?.name,
            TARGET_WORKER: port?.receiver,
        },
    });
}

function generateInport(port: InputPort): string {
    return getComponentSource({
        name: "ASYNC_RECEIVE_ACTION",
        config: {
            TYPE: sanitizeType(port.type),
            VAR_NAME: port.name,
            SENDER_WORKER: port?.sender,
        },
    });
}

function generateInputPorts(node: Node): string {
    if (!node.inputPorts || node.inputPorts.length === 0) {
        return undefined;
    }
    let inputPorts: string = "";
    node.inputPorts?.forEach((port) => {
        // int x1 = <- A;
        inputPorts += generateInport(port);
    });

    return inputPorts;
}

function generateOutputPorts(node: Node, expression?: string): string {
    if (!node.outputPorts || node.outputPorts.length === 0) {
        return undefined;
    }
    let outputPorts: string = "";
    node.outputPorts?.forEach((port) => {
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
        name: "ANNOTATION",
        config: {
            NODE: "Node",
            TEMPLATE_ID: node.templateId,
            X_CODE: node.canvasPosition?.x,
            Y_CODE: node.canvasPosition?.y,
            METADATA: node.metadata,
        },
    });
}

// TODO: remove once the backend model sends the correct type
function sanitizeType(type: string): string {
    const typeParts = type.split(":");
    return typeParts[typeParts.length - 1];
}

function removeLeadingSlash(path: string): string {
    if (path.startsWith("/")) {
        return path.substring(1);
    }
    return path;
}
