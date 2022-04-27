/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { QualifiedNameReference, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";

import { isEndpointNode } from "../../../../../utils";


export function getMatchingConnector(node: STNode): BallerinaConnectorInfo {
    let connector: BallerinaConnectorInfo;
    if (
        node && isEndpointNode(node) &&
        (STKindChecker.isLocalVarDecl(node) || STKindChecker.isModuleVarDecl(node)) &&
        STKindChecker.isQualifiedNameReference(node.typedBindingPattern.typeDescriptor)
    ) {
        const nameReference = node.typedBindingPattern.typeDescriptor as QualifiedNameReference;
        const typeSymbol = nameReference.typeData?.typeSymbol;
        const module = typeSymbol?.moduleID;
        if (typeSymbol && module) {
            connector = {
                name: typeSymbol.name,
                moduleName: module.moduleName,
                package: {
                    organization: module.orgName,
                    name: module.packageName || module.moduleName,
                    version: module.version,
                },
                functions: [],
            };
        }
    }

    return connector;
}
