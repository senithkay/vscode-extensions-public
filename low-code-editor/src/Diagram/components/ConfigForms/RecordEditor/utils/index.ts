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
import { RecordTypeDesc } from "@ballerina/syntax-tree";

import { DiagramEditorLangClientInterface, JsonToRecordResponse, STSymbolInfo } from "../../../../../Definitions";

export async function convertToRecord(json: string, lsUrl: string, ls?: any): Promise<string> {
    const langClient: DiagramEditorLangClientInterface = await ls.getDiagramEditorLangClient(lsUrl);
    const resp: JsonToRecordResponse = await langClient.convert(
        {
            jsonString: json
        }
    )
    return resp.codeBlock;
}

export function getRecordPrefix(symbolInfo: STSymbolInfo): string {
    if (symbolInfo?.recordTypeDescriptions?.size > 0) {
        const typeDesc: RecordTypeDesc = symbolInfo?.recordTypeDescriptions?.entries().next()?.value[1];
        const typeSymbol = typeDesc.typeData?.typeSymbol;
        if (typeSymbol) {
            return `${typeSymbol.moduleID.orgName}/${typeSymbol.moduleID.moduleName}:${typeSymbol.moduleID.version}:`;
        }
    }
    return null
}
