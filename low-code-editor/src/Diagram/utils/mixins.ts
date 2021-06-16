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
import { BallerinaConnectorsInfo, STSymbolInfo } from "../../Definitions";
import { getAllVariablesForAi, getFormattedModuleName } from "../../Diagram/components/Portals/utils";

export function getAllVariables(symbolInfo: STSymbolInfo): string[] {
    const variableCollection: string[] = [];
    const variableInfo = getAllVariablesForAi(symbolInfo);
    Object.keys(variableInfo).map((variable) => {
        variableCollection.push(variable);
    });
    return variableCollection;
}

// this function will return existing module variable name
export function getModuleVariable(symbolInfo: STSymbolInfo, connectorInfo: BallerinaConnectorsInfo): string {
    const moduleName = getFormattedModuleName(connectorInfo.module);
    let variableName: string;
    symbolInfo.variables?.forEach((nodes, type) => {
        if (type === `${moduleName}:${connectorInfo.name}` && nodes.length > 0 && variableName === undefined){
            // get first variable
            variableName = (nodes[0] as any)?.typedBindingPattern.bindingPattern?.variableName.value;
            return variableName;
        }
    });

    return variableName;
}
