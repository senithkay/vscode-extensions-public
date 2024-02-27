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
import {
    CommonRPCAPI,
    Completion,
    CompletionParams,
    DeleteSourceRequest,
    DeleteSourceResponse,
    GoToSourceRequest,
    STModification,
    SyntaxTreeResponse,
    TypeResponse,
    UpdateSourceRequest,
    UpdateSourceResponse,
    WorkspaceFileRequest,
    WorkspacesFileResponse
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { Uri, workspace } from "vscode";
import { StateMachine, navigate, openView } from "../../stateMachine";
import { goToSource } from "../../utils";
import { applyModifications, updateFileContent } from "../../utils/modification";

export class CommonRpcManager implements CommonRPCAPI {
    async getTypes(): Promise<TypeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const completionParams: CompletionParams = {
                textDocument: {
                    uri: Uri.file(context.documentUri!).toString()
                },
                context: {
                    triggerKind: 25,
                },
                position: {
                    character: 0,
                    line: 0
                }
            };

            const completions: Completion[] = await StateMachine.langClient().getCompletion(completionParams);
            const filteredCompletions: Completion[] = completions.filter(value => value.kind === 25);
            resolve({ data: { completions: filteredCompletions } });
        });
    }

    async updateSource(params: UpdateSourceRequest): Promise<UpdateSourceResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const modification: STModification = {
                type: "INSERT",
                isImport: false,
                config: {
                    "STATEMENT": params.source
                },
                ...params.position
            };
            const response = await applyModifications(context.documentUri!, [modification]) as SyntaxTreeResponse;
            if (response.parseSuccess) {
                await updateFileContent({ fileUri: context.documentUri!, content: response.source });
                navigate();
            }
        });
    }

    async deleteSource(params: DeleteSourceRequest): Promise<DeleteSourceResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const modification: STModification = {
                type: 'DELETE',
                ...params.position
            };

            const response = await applyModifications(context.documentUri!, [modification]) as SyntaxTreeResponse;
            if (response.parseSuccess) {
                await updateFileContent({ fileUri: context.documentUri!, content: response.source });
                navigate();
            }
        });
    }

    async goToSource(params: GoToSourceRequest): Promise<void> {
        const context = StateMachine.context();
        goToSource(params.position, context.documentUri!);
    }

    async getWorkspaceFiles(params: WorkspaceFileRequest): Promise<WorkspacesFileResponse> {
        // Get the workspace files form vscode workspace
        const files = [];
        // Get workspace path
        const workspaceRoot = workspace.workspaceFolders![0].uri.fsPath;
        const workspaceFiles = params.glob ? await workspace.findFiles(params.glob) : await workspace.findFiles('**/*.bal', '**/*test.bal');
        workspaceFiles.forEach(file => {
            // Push the file path relative to the workspace root without the leading slash
            files.push({relativePath: file.fsPath.replace(workspaceRoot, '').substring(1), path: file.fsPath});
        });
        return { files, workspaceRoot };
    }
}
