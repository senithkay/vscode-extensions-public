/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    VisualizerAPI,
    VisualizerLocationContext,
} from "@wso2-enterprise/ballerina-core";
import { BallerinaFunctionSTRequest } from "@wso2-enterprise/ballerina-languageclient";
import { getSyntaxTreeFromPosition, handleVisualizerView } from "../../utils/navigation";
import { getService, openView } from "../../visualizer/activator";
import { TextDocumentPositionParams } from "vscode-languageclient";
import { Uri } from "vscode";
import { STNode } from "@wso2-enterprise/syntax-tree";

export class VisualizerRpcManager implements VisualizerAPI {

    async getVisualizerState(): Promise<VisualizerLocationContext> {
        const snapshot = getService().getSnapshot();
        return new Promise((resolve) => {
            resolve(snapshot.context);
        });
    }

    async openVisualizerView(params: VisualizerLocationContext): Promise<VisualizerLocationContext> {
        return new Promise(async (resolve) => {
            if (params.location) {
                await handleVisualizerView(params);
            } else {
                openView(params);
            }
            const snapshot = getService().getSnapshot();
            resolve(snapshot.context);
        });
    }

    async getSyntaxTree(): Promise<STNode> {
        return new Promise(async (resolve) => {
            const context = getService().getSnapshot().context;
            const req: BallerinaFunctionSTRequest = {
                documentIdentifier: { uri: Uri.file(context.location.fileName).toString() },
                lineRange: {
                    start : {
                        line: context.location.position.startLine,
                        character: context.location.position.startColumn
                    },
                    end : {
                        line: context.location.position.endLine,
                        character: context.location.position.endColumn
                    }
                }
            };
            const node = await getSyntaxTreeFromPosition(req);
            if (node.parseSuccess) {
                resolve(node.syntaxTree);
            } else {
                resolve(undefined);
            }
        });
    }
}
