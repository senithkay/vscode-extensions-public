/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Mapping } from "@wso2-enterprise/ballerina-core";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputNode, ObjectOutputNode } from "../Node";
import { InputOutputPortModel } from "../Port";
import { OBJECT_OUTPUT_TARGET_PORT_PREFIX } from "./constants";

export function findInputNode(mapping: Mapping, outputNode: DataMapperNodeModel): InputNode {
    const nodes = outputNode.getModel().getNodes();

    const inputNode = nodes.find(node => {
        if (node instanceof InputNode) {
            return mapping.inputs.some(input => {
                const mappingStartsWith = input.split('.')[0];
                return node.inputType.id === mappingStartsWith;
            });

        }
    });

    return inputNode ? inputNode as InputNode : undefined;
}

export function getInputPort(node: InputNode, inputField: string): InputOutputPortModel {
    const port = node.getPort(`${inputField}.OUT`);
    return port ? port as InputOutputPortModel: undefined;
}

export function getOutputPort(
    node: ObjectOutputNode,
    outputField: string
): [InputOutputPortModel, InputOutputPortModel] {
    const portId = `${OBJECT_OUTPUT_TARGET_PORT_PREFIX}.${outputField}.IN`;
    const port = node.getPort(portId);
    
    if (port) {
        const actualPort = port as InputOutputPortModel;
        let mappedPort = actualPort;

        while (mappedPort && mappedPort.hidden) {
            mappedPort = mappedPort.parentModel;
        }

        return [actualPort, mappedPort];
    }
}
