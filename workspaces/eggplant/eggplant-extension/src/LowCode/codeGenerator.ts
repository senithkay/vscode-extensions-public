
import { STModification } from "@wso2-enterprise/ballerina-core";
import { LangClientInterface } from "@wso2-enterprise/eggplant-core";
import { Flow, SwitchNodeProperties } from "@wso2-enterprise/eggplant-diagram";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export function workerCodeGen(model: Flow) {
    const NODE = "Node";

    let workerBlocks: string = "";

    model.nodes.forEach(node => {
        let inputPorts: string = "";
        let outputPorts: string = "";

        node.inputPorts?.forEach(port => {
            // int x1 = <- A;
            inputPorts += `${port.type} ${port.name} = <- ${port?.sender};\n`;
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
            const switchBlockProper: SwitchNodeProperties = node.properties as SwitchNodeProperties;
            switchBlockProper.cases.forEach(switchCase => {
                let outputPort: string = "";
                // check the index of switchCase node
                const index = switchBlockProper.cases.indexOf(switchCase);
                switchCase.nodeIds.forEach(nodeId => {
                    // find the port matching the nodeId from outputPorts
                    const port = node.outputPorts.find(port => port.id === nodeId);
                    // x1 -> B;
                    outputPort += `${port?.name} -> ${port?.receiver};\n`;
                });

                if(index === 0) {
                    switchCaseBlock += `
                    if(${switchCase.expression.expression}) {
                        ${outputPort};
                    }\n
                `;
                } else {
                    switchCaseBlock += `
                    else if(${switchCase.expression.expression}) {
                        ${outputPort};
                    }\n
                `;
                }

            });

            switchBlockProper.defaultCase?.nodeIds.forEach(nodeId => {
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
                    xCord: ${node.canvasPosition.x},
                    yCord: ${node.canvasPosition.y}
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
                xCord: ${node.canvasPosition.x},
                yCord: ${node.canvasPosition.y}
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