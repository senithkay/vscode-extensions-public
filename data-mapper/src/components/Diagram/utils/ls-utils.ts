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
import {
    ExpressionEditorLangClientInterface,
    PublishDiagnosticsParams
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

export async function getDiagnostics(
    docUri: string,
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>): Promise<PublishDiagnosticsParams[]> {
    const langClient = await getLangClient();
    const diagnostics = await langClient.getDiagnostics({
        documentIdentifier: {
            uri: docUri,
        }
    });

    return diagnostics;
}

export const handleDiagnostics = async (fileURI: string,
                                        getLangClient: () => Promise<ExpressionEditorLangClientInterface>):
    Promise<Diagnostic[]> => {
    const diagResp = await getDiagnostics(`file://${fileURI}`, getLangClient);
    const diag = diagResp[0]?.diagnostics ? diagResp[0].diagnostics : [];
    return diag;
}

export function isNodeInRange(nodePosition: NodePosition, diagPosition: NodePosition): boolean {
    return nodePosition?.startLine >= diagPosition?.startLine &&
        (nodePosition?.startLine === diagPosition?.startLine ? nodePosition?.startColumn >= diagPosition?.startColumn : true) &&
        nodePosition?.endLine <= diagPosition?.endLine &&
        (nodePosition?.endLine === diagPosition?.endLine ? nodePosition?.endColumn <= diagPosition?.endColumn : true);
}
