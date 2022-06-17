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

import { BallerinaConnectorInfo, BallerinaConnectorRequest, DiagramEditorLangClientInterface, FormField, PrimitiveBalType }
    from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export async function fetchConnectorInfo(
    connector: BallerinaConnectorInfo,
    langServerURL?: string,
    currentFilePath?: string,
    getDiagramEditorLangClient?: (url: string) => Promise<DiagramEditorLangClientInterface>
): Promise<BallerinaConnectorInfo> {
    let connectorInfo;
    const connectorRequest: BallerinaConnectorRequest = {};
    // Connector request with connector_id
    if (!connectorInfo && connector && connector.id) {
        connectorRequest.id = connector.id;
    }
    // Connector request with FQN
    if (!connectorInfo && connector && connector.moduleName && connector.package) {
        connectorRequest.name = connector.name;
        connectorRequest.moduleName = connector.moduleName;
        connectorRequest.orgName = connector.package.organization;
        connectorRequest.packageName = connector.package.name;
        connectorRequest.version = connector.package.version;
        connectorRequest.targetFile = currentFilePath;
    }
    if (!connectorInfo && connectorRequest) {
        const langClient = await getDiagramEditorLangClient(langServerURL);
        const connectorResp = await langClient?.getConnector(connectorRequest);
        if (connectorResp) {
            connectorInfo = connectorResp as BallerinaConnectorInfo;
        }
    }
    return connectorInfo;
}

export function getDefaultParams(parameters: FormField[], depth = 1): string[] {
    if (!parameters) {
        return [];
    }
    const parameterList: string[] = [];
    parameters.forEach(parameter => {
        if (parameter.defaultable || parameter.optional) {
            return;
        }
        let draftParameter = "";
        switch (parameter.typeName) {
            case PrimitiveBalType.String:
                draftParameter = getFieldValuePair(parameter, `""`, depth);
                break;
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Decimal:
                draftParameter = getFieldValuePair(parameter, `0`, depth);
                break;
            case PrimitiveBalType.Boolean:
                draftParameter = getFieldValuePair(parameter, `true`, depth);
                break;
            case PrimitiveBalType.Array:
                draftParameter = getFieldValuePair(parameter, `[]`, depth);
                break;
            case PrimitiveBalType.Xml:
                draftParameter = getFieldValuePair(parameter, 'xml ``', depth);
                break;
            case PrimitiveBalType.Nil:
            case "()":
                draftParameter = getFieldValuePair(parameter, `()`, depth);
                break;
            case PrimitiveBalType.Json:
            case "map":
                draftParameter = getFieldValuePair(parameter, `{}`, depth);
                break;
            case PrimitiveBalType.Record:
                const insideParamList = getDefaultParams(parameter.fields, depth + 1);
                draftParameter = getFieldValuePair(parameter, `{${insideParamList?.join()}}`, depth);
                break;
            case PrimitiveBalType.Union:
                const firstMember = parameter.members[ 0 ];
                const firstMemberParams = getDefaultParams([ firstMember ], depth + 1);
                const defaultParam = (firstMember.typeName === PrimitiveBalType.Record) ?
                    `{${firstMemberParams?.join()}}` : `${firstMemberParams?.join()}`;
                draftParameter = getFieldValuePair(parameter, defaultParam, depth);
                break;
            case "inclusion":
                const inclusionParams = getDefaultParams([ parameter.inclusionType ], depth + 1);
                draftParameter = getFieldValuePair(parameter, `${inclusionParams?.join()}`, depth);
                break;

            default:
                break;
        }
        if (draftParameter !== "") {
            parameterList.push(draftParameter);
        }
    });
    return parameterList;
}

function getFieldValuePair(parameter: FormField, defaultValue: string, depth: number): string {
    if (depth > 1) {
        return `${parameter.name}: ${defaultValue}`;
    }
    return defaultValue;
}
