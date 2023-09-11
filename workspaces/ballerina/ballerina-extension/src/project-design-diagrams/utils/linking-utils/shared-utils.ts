/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Connector } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { getFormattedModuleName } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/utils/Diagram/modification-util";
import { CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { STResponse } from "../../activator";

export function getMissingImports(source: string, imports: Set<string>) {
    const missingImports = new Set<string>();
    if (imports && imports?.size > 0) {
        imports.forEach(function (stmt) {
            if (!source.includes(`import ${stmt};`)) {
                missingImports.add(stmt);
            }
        });
    }
    return missingImports;
}

export function genClientName(source: string, prefix: string, connector?: Connector) {
    if (connector && !connector.moduleName) {
        return prefix;
    }

    let moduleName: string = "";
    if (connector && connector.moduleName) {
        moduleName = getFormattedModuleName(connector.moduleName);
    }

    let index = 0;
    let varName = moduleName + prefix;
    let tempName = varName;
    while (source.indexOf(tempName) > 0) {
        index++;
        tempName = varName + index;
    }

    return tempName;
}

export function getServiceDeclaration(members: any[], service: Service, checkEnd: boolean): ServiceDeclaration {
    return members.find((member) => (
        member.kind === "ServiceDeclaration" &&
        service.elementLocation.startPosition.line === member.position.startLine &&
        service.elementLocation.startPosition.offset === member.position.startColumn && (
            checkEnd ? service.elementLocation.endPosition.line === member.position.endLine &&
                service.elementLocation.endPosition.offset === member.position.endColumn : true
        )
    ));
}

export function getMainFunction(stResponse: STResponse) {
    return stResponse.syntaxTree.members.find((member: any) => member.kind === 'FunctionDefinition'
        && member.functionName.value === 'main');
}
