/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeProperties, SCOPE } from "@wso2-enterprise/ballerina-core";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { FunctionFindingVisitor } from "../../utils/function-finding-visitor";

export const DATA_MAPPING_FILE_NAME = "data_mappings.bal";

const INTEGRATION_API_MODULES = ["http", "graphql", "tcp"];
const EVENT_INTEGRATION_MODULES = ["kafka", "rabbitmq", "salesforce", "trigger.github", "mqtt", "asb"];
const FILE_INTEGRATION_MODULES = ["ftp", "file"];


export function getFunctionNodePosition(nodeProperties: NodeProperties, syntaxTree: STNode): NodePosition {
    const functionName = nodeProperties.hasOwnProperty("functionName")
        ? nodeProperties["functionName"].value as string
        : "";
    const functionFindingVisitor = new FunctionFindingVisitor(functionName);
    traversNode(syntaxTree, functionFindingVisitor);
    const functionNode = functionFindingVisitor.getFunctionNode();

    return functionNode.position;
}

export function findScopeByModule(moduleName: string): SCOPE {
    if (INTEGRATION_API_MODULES.includes(moduleName)) {
        return SCOPE.INTEGRATION_AS_API;
    } else if (EVENT_INTEGRATION_MODULES.includes(moduleName)) {
        return SCOPE.EVENT_INTEGRATION;
    } else if (FILE_INTEGRATION_MODULES.includes(moduleName)) {
        return SCOPE.FILE_INTEGRATION;
    }
    return SCOPE.ANY;
}
