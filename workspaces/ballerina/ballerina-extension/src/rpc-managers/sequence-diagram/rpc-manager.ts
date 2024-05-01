/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 *
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { SequenceDiagramAPI, SequenceModelResponse, SequenceModelDiagnostic } from "@wso2-enterprise/ballerina-core";
import { SequenceDiagramModelRequest } from "src/core";
import { StateMachine } from "../../stateMachine";
import { Uri } from "vscode";

export class SequenceDiagramRpcManager implements SequenceDiagramAPI {
    async getSequenceModel(): Promise<SequenceModelResponse | SequenceModelDiagnostic> {
        return new Promise((resolve) => {
            const context = StateMachine.context();
            if (!context.position) {
                resolve(undefined);
            }
            const params: SequenceDiagramModelRequest = {
                filePath: Uri.parse(context.documentUri!).fsPath,
                startLine: {
                    line: context.position.startLine ?? 0,
                    offset: context.position.startColumn ?? 0,
                },
                endLine: {
                    line: context.position.endLine ?? 0,
                    offset: context.position.endColumn ?? 0,
                },
            };
            console.log(">>> requesting sequence model from backend ...", params);
            StateMachine.langClient()
                .getSequenceDiagramModel(params)
                .then((model) => {
                    console.log(">>> sequence model from backend:", model);
                    if (model.sequenceDiagram) {
                        resolve(model.sequenceDiagram as SequenceModelResponse);
                    }
                    if (model.modelDiagnostic) {
                        resolve(model.modelDiagnostic);
                    }
                    resolve(undefined);
                })
                .catch((error) => {
                    console.log(">>> ERROR from backend:", error);
                    resolve(undefined);
                });
        });
    }
}
