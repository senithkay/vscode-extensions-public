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
import { FunctionDefinitionInfo } from "../../ConfigurationSpec/types";
import { Connector } from "../../Definitions";

export function filterConnectorFunctions(connector: Connector, fieldsForFunctions: Map<string, FunctionDefinitionInfo>): Map<string, FunctionDefinitionInfo> {
    let filteredFunctions: Map<string, FunctionDefinitionInfo> = new Map();
    const connectorName: string = connector.package.organization + "_" + connector.moduleName + "_" + connector.name;

    switch (connectorName) {
        // INFO: Use this section to specify a single connector.
        // case 'ballerinax_github_Client':
        //     fieldsForFunctions.forEach((value: FunctionDefinitionInfo, key) => {
        //         if (key === INIT) {
        //             value.parameters.find(fields => fields.name === "config").fields
        //                 .forEach(field => {
        //                     if (field.name !== "auth") {
        //                         field.optional = true;
        //                     }
        //                 });
        //         }
        //         filteredFunctions.set(key, value);
        //     });
        //     break;
        default:
            filteredFunctions = fieldsForFunctions;
            break;
    }

    return filteredFunctions;
}
