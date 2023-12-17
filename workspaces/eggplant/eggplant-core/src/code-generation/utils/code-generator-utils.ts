/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BalExpression, Flow, InputPort, Node, OutputPort, SwitchCaseBlock, SwitchNodeProperties } from "../../rpc-types/webview/types";
import { getComponentSource } from "./template-utils";

export function workerCodeGen(model: Flow): string {
    let workerBlocks: string = "";
    // use the util functions and generate the workerblocks
    model?.nodes.forEach(node => {
        if (node.templateId === "switch") {
            workerBlocks += generateSwitchNode(node);
        } else {
            workerBlocks += generateBlockNode(node);
        }
    });

    // generate ballerina function
    const ballerinaFunction: string = `
    public function main() returns error? {
        ${workerBlocks}
    };`

    return ballerinaFunction;
}


function generateBlockNode(node: Node): string {
    const workerNode: string = getComponentSource({
        name: 'CODE_BLOCK_NODE',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: generateInputPorts(node),
            CODE_BLOCK: node?.codeBlock ? node.codeBlock : undefined,
            OUTPUT_PORTS: generateOutputPorts(node)
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
    if (switchProperties.defaultCase) {
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
    }

    // generate switch node
    const switchNode: string = getComponentSource({
        name: 'SWITCH_NODE',
        config: {
            NODE_NAME: node.name,
            INPUT_PORTS: generateInputPorts(node),
            CODE_BLOCK: node?.codeBlock ? node.codeBlock : undefined,
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

function generateOutport(port: OutputPort): string {
    return getComponentSource({
        name: 'ASYNC_SEND_ACTION',
        config: {
            EXPRESSION: port?.name,
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

function generateOutputPorts(node: Node): string {
    if (!node.outputPorts || node.outputPorts.length === 0) {
        return undefined;
    }
    let outputPorts: string = "";
    node.outputPorts?.forEach(port => {
        // x1 -> B;
        outputPorts += generateOutport(port);
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
    const typeParts = type.split(":");
    return typeParts[typeParts.length - 1];
}
