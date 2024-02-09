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
    Completion,
    CompletionParams,
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    GoToSourceRequest,
    KeywordTypeResponse,
    RecordSTRequest,
    RecordSTResponse,
    visitor as RecordsFinderVisitor,
    ResourceResponse,
    STModification,
    ServiceDesignerAPI,
    ServiceResponse,
    SyntaxTreeResponse,
    UpdateResourceRequest,
    UpdateServiceRequest
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";
import { StateMachine, openView } from "../../stateMachine";
import { goToSource } from "../../utils";
import { applyModifications, updateFileContent } from "../../utils/modification";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {
    async createService(params: CreateServiceRequest): Promise<ServiceResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateService(params: UpdateServiceRequest): Promise<ServiceResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteService(params: DeleteServiceRequest): Promise<ServiceResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createResource(params: CreateResourceRequest): Promise<ResourceResponse> {
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
                const st = response.syntaxTree as ModulePart;
                st.members.forEach(member => {
                    if (STKindChecker.isServiceDeclaration(member)) {
                        const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                        if (identifier === context.identifier) {
                            openView("OPEN_VIEW", { position: member.position });
                        }
                    }
                });
            }
        });
    }

    async updateResource(params: UpdateResourceRequest): Promise<ResourceResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteResource(params: DeleteResourceRequest): Promise<ResourceResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const modification: STModification = {
                type: 'DELETE',
                ...params.position
            };

            const response = await applyModifications(context.documentUri!, [modification]) as SyntaxTreeResponse;
            if (response.parseSuccess) {
                await updateFileContent({ fileUri: context.documentUri!, content: response.source });
                const st = response.syntaxTree as ModulePart;
                st.members.forEach(member => {
                    if (STKindChecker.isServiceDeclaration(member)) {
                        const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                        if (identifier === context.identifier) {
                            openView("OPEN_VIEW", { position: member.position });
                        }
                    }
                });
            }
        });
    }

    async getKeywordTypes(): Promise<KeywordTypeResponse> {
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
            resolve({ data: { completions: completions.filter(value => value.kind === 25) } });
        });
    }

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        return new Promise(async (resolve) => {
            const context = StateMachine.context();
            const fileUri = Uri.file(context.documentUri!).toString();
            const stResponse = await StateMachine.langClient().getSyntaxTree({ documentIdentifier: { uri: fileUri } }) as SyntaxTreeResponse;
            traversNode(stResponse.syntaxTree, RecordsFinderVisitor);
            const records = RecordsFinderVisitor.getRecords();
            const recordST = records.get(params.recordName);
            if (recordST !== undefined) {
                resolve({ recordST });
            } else {
                // Handle the case where recordST is undefined, perhaps throw an error or return a default value
                throw new Error(`Record with name ${params.recordName} not found.`);
            }
        });
    }

    async goToSource(params: GoToSourceRequest): Promise<void> {
        const context = StateMachine.context();
        goToSource(params.position, context.documentUri!);
    }
}
