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
    DIRECTORY_MAP,
    ExportOASRequest,
    ExportOASResponse,
    HttpResourceModelRequest,
    HttpResourceModelResponse,
    ListenerModelRequest,
    ListenerModelResponse,
    ListenerSourceCodeRequest,
    ListenerSourceCodeResponse,
    ListenersRequest,
    ListenersResponse,
    OpenAPISpec,
    ProjectStructureResponse,
    RecordSTRequest,
    RecordSTResponse,
    ResourceSourceCodeRequest,
    ResourceSourceCodeResponse,
    STModification,
    ServiceDesignerAPI,
    ServiceModelFromCodeRequest,
    ServiceModelFromCodeResponse,
    ServiceModelRequest,
    ServiceModelResponse,
    ServiceSourceCodeRequest,
    SourceUpdateResponse,
    SyntaxTree,
    buildProjectStructure
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, NodePosition, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { commands, Uri, window, workspace } from "vscode";
import { StateMachine } from "../../stateMachine";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: ProjectStructureResponse = await buildProjectStructure(context.projectUri, context.langClient);
            res.directoryMap[DIRECTORY_MAP.TYPES].forEach(type => {
                if (type.name === params.recordName) {
                    resolve({ recordST: type.st as TypeDefinition });
                }
            });
            resolve(null);
        });
    }

    async exportOASFile(params: ExportOASRequest): Promise<ExportOASResponse> {
        return new Promise(async (resolve) => {
            const res: ExportOASResponse = { openSpecFile: null };
            const documentFilePath = params.documentFilePath ? params.documentFilePath : StateMachine.context().documentUri;
            const spec = await StateMachine.langClient().convertToOpenAPI({ documentFilePath }) as OpenAPISpec;
            if (spec.content) {
                // Convert the OpenAPI spec to a YAML string
                const yamlStr = yaml.dump(spec.content[0].spec);
                window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, openLabel: 'Select OAS Save Location' })
                    .then(uri => {
                        if (uri && uri[0]) {
                            const projectLocation = uri[0].fsPath;
                            // Construct the correct path for the output file
                            const filePath = path.join(projectLocation, `${spec.content[0]?.serviceName}_openapi.yaml`);

                            // Save the YAML string to the file
                            fs.writeFileSync(filePath, yamlStr, 'utf8');
                            // Set the response
                            res.openSpecFile = filePath;
                            // Open the file in a new VSCode document
                            workspace.openTextDocument(filePath).then(document => {
                                window.showTextDocument(document);
                            });
                        }
                    });
            } else {
                window.showErrorMessage(spec.error);
            }
            resolve(res);
        });
    }

    async getListeners(params: ListenersRequest): Promise<ListenersResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                const res: ListenersResponse = await context.langClient.getListeners(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getListenerModel(params: ListenerModelRequest): Promise<ListenerModelResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: ListenerModelResponse = await context.langClient.getListenerModel(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async updateListenerSourceCode(params: ListenerSourceCodeRequest): Promise<SourceUpdateResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                const res: ListenerSourceCodeResponse = await context.langClient.updateListenerSourceCode(params);
                const position = await this.updateSource(res);
                const result: SourceUpdateResponse = {
                    filePath: targetFile,
                    position: position
                }
                if (StateMachine.context().isBI) {
                    commands.executeCommand("BI.project-explorer.refresh");
                }
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getServiceModel(params: ServiceModelRequest): Promise<ServiceModelResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                const res: ServiceModelResponse = await context.langClient.getServiceModel(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async updateServiceSourceCode(params: ServiceSourceCodeRequest): Promise<SourceUpdateResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                const listenerName = params.service.properties["listener"].value;
                const res: ListenerSourceCodeResponse = await context.langClient.updateServiceSourceCode(params);
                const position = await this.updateSource(res, listenerName);
                const result: SourceUpdateResponse = {
                    filePath: targetFile,
                    position: position
                }
                if (StateMachine.context().isBI) {
                    commands.executeCommand("BI.project-explorer.refresh");
                }
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getServiceModelFromCode(params: ServiceModelFromCodeRequest): Promise<ServiceModelFromCodeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: ServiceModelFromCodeResponse = await context.langClient.getServiceModelFromCode(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getHttpResourceModel(params: HttpResourceModelRequest): Promise<HttpResourceModelResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: HttpResourceModelResponse = await context.langClient.getHttpResourceModel(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async updateResourceSourceCode(params: ResourceSourceCodeRequest): Promise<SourceUpdateResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                const res: ResourceSourceCodeResponse = await context.langClient.updateResourceSourceCode(params);
                const position = await this.updateSource(res);
                const result: SourceUpdateResponse = {
                    filePath: targetFile,
                    position: position
                }
                resolve(result);
            } catch (error) {
                console.log(error);
            }
        });
    }

    private async updateSource(params: ListenerSourceCodeResponse, identifier?: string): Promise<NodePosition> {
        const modificationRequests: Record<string, { filePath: string; modifications: STModification[] }> = {};
        let position: NodePosition;
        for (const [key, value] of Object.entries(params.textEdits)) {
            const fileUri = Uri.file(key);
            const fileUriString = fileUri.toString();
            const edits = value;

            if (edits && edits.length > 0) {
                const modificationList: STModification[] = [];

                for (const edit of edits) {
                    const stModification: STModification = {
                        startLine: edit.range.start.line,
                        startColumn: edit.range.start.character,
                        endLine: edit.range.end.line,
                        endColumn: edit.range.end.character,
                        type: "INSERT",
                        isImport: false,
                        config: {
                            STATEMENT: edit.newText,
                        },
                    };
                    modificationList.push(stModification);
                }

                if (modificationRequests[fileUriString]) {
                    modificationRequests[fileUriString].modifications.push(...modificationList);
                } else {
                    modificationRequests[fileUriString] = { filePath: fileUri.fsPath, modifications: modificationList };
                }
            }
        }

        // Iterate through modificationRequests and apply modifications
        try {
            for (const [fileUriString, request] of Object.entries(modificationRequests)) {
                const { parseSuccess, source, syntaxTree } = (await StateMachine.langClient().stModify({
                    documentIdentifier: { uri: fileUriString },
                    astModifications: request.modifications,
                })) as SyntaxTree;

                if (parseSuccess) {
                    identifier && (syntaxTree as ModulePart).members.forEach(member => {
                        if (STKindChecker.isServiceDeclaration(member) && member.source.includes(identifier)) {
                            position = member.position;
                        }
                    });
                    fs.writeFileSync(request.filePath, source);
                    await StateMachine.langClient().didChange({
                        textDocument: { uri: fileUriString, version: 1 },
                        contentChanges: [
                            {
                                text: source,
                            },
                        ],
                    });

                    await StateMachine.langClient().resolveMissingDependencies({
                        documentIdentifier: { uri: fileUriString },
                    });
                    // Temp fix: ResolveMissingDependencies does not work uless we call didOpen, This needs to be fixed in the LS
                    await StateMachine.langClient().didOpen({
                        textDocument: { uri: fileUriString, languageId: "ballerina", version: 1, text: source },
                    });
                }
            }
        } catch (error) {
            console.log(">>> error updating source", error);
        }
        return position;
    }
}
