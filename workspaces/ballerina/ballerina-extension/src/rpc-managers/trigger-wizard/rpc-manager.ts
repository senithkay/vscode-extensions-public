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
    EVENT_TYPE,
    ListenerService,
    MACHINE_VIEW,
    NodePosition,
    ReferenceLSRequest,
    STModification,
    ServicesByListenerRequest,
    ServicesByListenerResponse,
    SyntaxTree,
    Trigger,
    TriggerFunctionRequest,
    TriggerFunctionResponse,
    TriggerModelFromCodeRequest,
    TriggerModelFromCodeResponse,
    TriggerModelRequest,
    TriggerModelResponse,
    TriggerModelsRequest,
    TriggerModelsResponse,
    TriggerParams,
    TriggerSourceCodeRequest,
    TriggerSourceCodeResponse,
    TriggerWizardAPI,
    Triggers,
    TriggersParams
} from "@wso2-enterprise/ballerina-core";
import { ListenerDeclaration, ModulePart, STKindChecker, ServiceDeclaration } from "@wso2-enterprise/syntax-tree";
import { existsSync, writeFileSync } from "fs";
import path from "path";
import { Uri, commands } from "vscode";
import { URI } from "vscode-uri";
import { StateMachine, openView, updateView } from "../../stateMachine";

export class TriggerWizardRpcManager implements TriggerWizardAPI {
    async getTriggers(params: TriggersParams): Promise<Triggers> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const res: Triggers = await context.langClient.getTriggers(params) as Triggers;
            resolve(res);
        });
    }

    async getTrigger(params: TriggerParams): Promise<Trigger> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: Trigger = await context.langClient.getTrigger(params) as Trigger;
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getServicesByListener(params: ServicesByListenerRequest): Promise<ServicesByListenerResponse> {
        return new Promise(async (resolve) => {
            const services: ListenerService[] = [];
            const position: NodePosition = params.position ? params.position : StateMachine.context().position;
            const listenerUri = URI.file(StateMachine.context().documentUri).toString();
            const refReq: ReferenceLSRequest = {
                textDocument: { uri: listenerUri },
                position: {
                    character: position.endColumn - 1,
                    line: position.endLine
                },
                context: {
                    includeDeclaration: false
                }
            };
            const references = await StateMachine.langClient().getReferences(refReq);

            for (const res of references) {
                try {
                    const refSt = await StateMachine.langClient().getSTByRange({ documentIdentifier: { uri: res.uri }, lineRange: res.range }) as SyntaxTree;
                    if (STKindChecker.isSimpleNameReference(refSt.syntaxTree)) {
                        const nameRef = refSt.syntaxTree;
                        console.log(refSt);
                        const st = await StateMachine.langClient().getSyntaxTree({ documentIdentifier: { uri: res.uri } }) as SyntaxTree;
                        const filePath = URI.parse(res.uri).fsPath;
                        const modulePart = st.syntaxTree as ModulePart;
                        modulePart.members.forEach(member => {
                            if (STKindChecker.isServiceDeclaration(member) && member.expressions && member.expressions.length > 0) {
                                const expression = member.expressions[0];
                                if (JSON.stringify(expression.position) === JSON.stringify(nameRef.position)) {
                                    services.push({ name: getServiceName(member), service: member, filePath });
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            const listenerST = await StateMachine.langClient().getSTByRange({
                documentIdentifier: { uri: listenerUri },
                lineRange: {
                    start: { line: position.startLine, character: position.startColumn },
                    end: { line: position.endLine, character: position.endColumn }
                }
            }) as SyntaxTree;

            const listener = listenerST.syntaxTree as ListenerDeclaration;
            let trigger: Trigger = null;
            if (STKindChecker.isQualifiedNameReference(listener.typeDescriptor)) {
                const module = listener.typeDescriptor.typeData?.typeSymbol?.moduleID;
                const orgName = module.orgName;
                const packageName = module.packageName;
                trigger = await StateMachine.langClient().getTrigger({ orgName, packageName }) as Trigger;
            }
            resolve({ listener, services, trigger });
        });
    }

    async getTriggerModels(params: TriggerModelsRequest): Promise<TriggerModelsResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: TriggerModelsResponse = await context.langClient.getTriggerModels(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getTriggerModel(params: TriggerModelRequest): Promise<TriggerModelResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: TriggerModelResponse = await context.langClient.getTriggerModel(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async getTriggerSourceCode(params: TriggerSourceCodeRequest): Promise<TriggerSourceCodeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                if (!existsSync(targetFile)) {
                    writeFileSync(targetFile, '');
                }
                const res: TriggerSourceCodeResponse = await context.langClient.getTriggerSourceCode(params);
                const identifier = params.trigger.properties['name'].value;
                const position = await this.updateSource(res, identifier);
                commands.executeCommand("BI.project-explorer.refresh");
                openView(EVENT_TYPE.OPEN_VIEW, { documentUri: targetFile, position });
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    private async updateSource(params: TriggerSourceCodeResponse, identifier?: string,): Promise<NodePosition> {
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
                        if (STKindChecker.isServiceDeclaration(member) && member.metadata.source.includes(identifier)) {
                            position = member.position;
                        }
                    });
                    writeFileSync(request.filePath, source);
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

    async getTriggerModelFromCode(params: TriggerModelFromCodeRequest): Promise<TriggerModelFromCodeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: TriggerModelFromCodeResponse = await context.langClient.getTriggerModelFromCode(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async addTriggerFunction(params: TriggerFunctionRequest): Promise<TriggerFunctionResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: TriggerFunctionResponse = await context.langClient.addTriggerFunction(params);
                await this.updateSource(res);
                updateView();
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async updateTriggerFunction(params: TriggerFunctionRequest): Promise<TriggerFunctionResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const res: TriggerFunctionResponse = await context.langClient.updateTriggerFunction(params);
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }

    async updateTriggerSourceCode(params: TriggerSourceCodeRequest): Promise<TriggerSourceCodeResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            try {
                const projectDir = path.join(StateMachine.context().projectUri);
                const targetFile = path.join(projectDir, `triggers.bal`);
                params.filePath = targetFile;
                if (!existsSync(targetFile)) {
                    writeFileSync(targetFile, '');
                }
                const res: TriggerSourceCodeResponse = await context.langClient.updateTriggerSourceCode(params);
                await this.updateSource(res);
                updateView();
                resolve(res);
            } catch (error) {
                console.log(error);
            }
        });
    }
}

function getServiceName(parent: ServiceDeclaration): string {
    let servicePath = "";
    parent.absoluteResourcePath.forEach(item => {
        servicePath += item.source.trim();
    });
    return servicePath;
}
