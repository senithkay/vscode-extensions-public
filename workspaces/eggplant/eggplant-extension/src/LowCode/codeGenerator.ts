
import { BalExpression, Flow, SwitchCaseBlock, SwitchNodeProperties } from "@wso2-enterprise/eggplant-diagram";

export function workerCodeGen(model: Flow): string {
    const NODE = "Node";

    let workerBlocks: string = "";

    model.nodes.forEach(node => {
        let inputPorts: string = "";
        let outputPorts: string = "";

        node.inputPorts?.forEach(port => {
            // int x1 = <- A;

            inputPorts += `${sanitizeType(port.type)} ${port.name} = <- ${port?.sender};\n`;
        });

        node.outputPorts?.forEach(port => {
            // x1 -> B;
            outputPorts += `${port.name} -> ${port?.receiver};\n`;
        });

        // Define the workerNode
        let workerNode: string;

        if (node.templateId === "switch") {
            // define the switch case block
            let switchCaseBlock: string = "";
            const switchProperties: SwitchNodeProperties = node.properties as SwitchNodeProperties;
            switchProperties.cases.forEach((switchCase: SwitchCaseBlock) => {
                let outputPort: string = "";
                // check the index of switchCase node
                const index = switchProperties.cases.indexOf(switchCase);
                switchCase.nodes.forEach(nodeId => {
                    // find the port matching the nodeId from outputPorts
                    const port = node.outputPorts.find(port => port.id === nodeId);
                    // x1 -> B;
                    outputPort += `${port?.name} -> ${port?.receiver};\n`;
                });

                // check if the switchcase.expression is a string or a bal expression
                let expression: string;
                if (typeof switchCase.expression === 'string') {
                    expression = switchCase.expression;
                } else {
                    expression = (switchCase.expression as BalExpression).expression;
                }

                if (index === 0) {
                    switchCaseBlock += `
                    if(${expression}) {
                        ${outputPort}
                    }\n
                `;
                } else {
                    switchCaseBlock += `
                    else if(${expression}) {
                        ${outputPort}
                    }\n
                `;
                }

            });

            switchProperties.defaultCase?.nodes.forEach(nodeId => {
                // find the port matching the nodeId from outputPorts
                const port = node.outputPorts.find(port => port.id === nodeId);
                // x1 -> B;
                switchCaseBlock += `
                    else {
                        ${port?.name} -> ${port?.receiver};
                    }\n
                `;
            });

            workerNode = `
                @display {
                    label: "${NODE}",
                    templateId: "${node.templateId}",
                    xCord: ${node.canvasPosition?.x},
                    yCord: ${node.canvasPosition?.y}
                }
                worker ${node.name} {
                    ${inputPorts}
                    ${node?.codeBlock}
                    ${switchCaseBlock}
                }\n
            `;
        } else {
            workerNode = `
            @display {
                label: "${NODE}",
                templateId: "${node.templateId}",
                xCord: ${node.canvasPosition?.x},
                yCord: ${node.canvasPosition?.y}
            }
            worker ${node.name} {
                ${inputPorts}
                ${node?.codeBlock}
                ${outputPorts}
            }\n
        `;
        }

        workerBlocks += workerNode;
    });
    // generate ballerina function
    const ballerinaFunction: string = `
    public function main() returns error? {
        ${workerBlocks}
    };`

    return ballerinaFunction;
}


function sanitizeType(type: string): string {
    const typeParts = type.split(":");
    return typeParts[typeParts.length - 1];
}
