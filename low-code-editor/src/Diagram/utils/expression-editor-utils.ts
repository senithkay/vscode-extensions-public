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
import { ExpressionEditorState } from "../store/definitions";

export function expEditorStart(editor: ExpressionEditorState, diagramContext: any, diagnosticCallBack: () => void) {
    const { state: { langClient, getWindowObject }, expressionEditorStart, expressionEditorDiagnosticsChange } = diagramContext;
    return async () => {
        await langClient.didChange({
            contentChanges: [
                {
                    text: editor.content
                }
            ],
            textDocument: {
                uri: editor.uri,
                version: 1
            }
        });
        getWindowObject().expEditorObject = editor;
        langClient.diagnostics({
            documentIdentifier: {
                uri: editor.uri,
            }
        }).then((diagResp: any) => {
            getWindowObject().expEditorObject = {
                ...getWindowObject().expEditorObject,
                diagnostic: diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : []
            }
            diagnosticCallBack();
        });
    };
}

export function expEditorContentChange(editor: ExpressionEditorState, diagramContext: any, diagnosticCallBack: () => void) {
    const { state: { langClient, getWindowObject }, expressionEditorContentChange, expressionEditorDiagnosticsChange } = diagramContext;
    return async () => {
        await langClient.didChange({
            contentChanges: [
                {
                    text: editor.content
                }
            ],
            textDocument: {
                uri: editor.uri,
                version: 1
            }
        });
        // expressionEditorContentChange(editor);
        getWindowObject().expEditorObject = editor;
        langClient.diagnostics({
            documentIdentifier: {
                uri: editor.uri,
            }
        }).then((diagResp: any) => {
            getWindowObject().expEditorObject = {
                ...getWindowObject().expEditorObject,
                diagnostic: diagResp[0]?.diagnostics ? diagResp[0]?.diagnostics : []
            }
            diagnosticCallBack();
        });
    };
}

export function expEditorClose(editor: ExpressionEditorState, diagramContext: any) {
    const { state: { langClient, getWindowObject }, expressionEditorClose } = diagramContext;
    return async () => {
        await langClient.didChange({
            contentChanges: [
                {
                    text: editor.content
                }
            ],
            textDocument: {
                uri: editor.uri,
                version: 1
            }
        });
        getWindowObject().expEditorObject = {
            content: undefined,
            name: undefined,
            uri: undefined,
            diagnostic: []
        };
    };
}
