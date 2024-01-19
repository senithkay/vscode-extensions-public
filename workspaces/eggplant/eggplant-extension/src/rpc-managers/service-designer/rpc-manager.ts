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
    CompletionParams,
    CompletionResponse,
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    KeywordTypeResponse,
    RecordSTRequest,
    RecordSTResponse,
    STModification,
    ServiceDesignerAPI,
    UpdateResourceRequest,
    UpdateServiceRequest
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";
import { StateMachine, openView } from "../../stateMachine";
import { applyModifications, updateFileContent } from "../../utils/modification";
import { visitor as RecordsFinderVisitor } from "@wso2-enterprise/ballerina-core";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {
    async createService(params: CreateServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async updateService(params: UpdateServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteService(params: DeleteServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createResource(params: CreateResourceRequest): Promise<void> {
        const context = StateMachine.context();
        const modification: STModification = {
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": params.source
            },
            ...params.position
        };
        const response = await applyModifications(context.fileName!, [modification]);
        if (response.parseSuccess) {
            await updateFileContent({ fileUri: context.fileName!, content: response.source });
            const st = response.syntaxTree as ModulePart;
            st.members.forEach(member => {
                if (STKindChecker.isServiceDeclaration(member)) {
                    const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                    if (identifier === context.identifier) {
                        openView({ position: member.position });
                    }
                }
            });
        }
    }

    async updateResource(params: UpdateResourceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteResource(params: DeleteResourceRequest): Promise<void> {
        const context = StateMachine.context();
        const modification: STModification = {
            type: 'DELETE',
            ...params.position
        };

        const response = await applyModifications(context.fileName!, [modification]);
        if (response.parseSuccess) {
            await updateFileContent({ fileUri: context.fileName!, content: response.source });
            const st = response.syntaxTree as ModulePart;
            st.members.forEach(member => {
                if (STKindChecker.isServiceDeclaration(member)) {
                    const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                    if (identifier === context.identifier) {
                        openView({ position: member.position });
                    }
                }
            });
        }
    }

    async getKeywordTypes(): Promise<KeywordTypeResponse> {
        const context = StateMachine.context();
        const completionParams: CompletionParams = {
            textDocument: {
                uri: Uri.file(context.fileName!).toString()
            },
            context: {
                triggerKind: 25,
            },
            position: {
                character: 0,
                line: 0
            }
        }

        const langClient = await context.langServer!;
        const completions: CompletionResponse[] = await langClient.getCompletion(completionParams);
        return { completions: completions.filter(value => value.kind === 25) };
    }

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        const context = StateMachine.context();
        const langClient = await context.langServer!;
        const fileUri = Uri.file(context.fileName!).toString();
        const stResponse = await langClient.getSyntaxTree({ documentIdentifier: { uri: fileUri } });
        traversNode(stResponse.syntaxTree, RecordsFinderVisitor);
        const records = RecordsFinderVisitor.getRecords();
        const recordST = records.get(params.recordName);
        if (recordST !== undefined) {
            return { recordST };
        } else {
            // Handle the case where recordST is undefined, perhaps throw an error or return a default value
            throw new Error(`Record with name ${params.recordName} not found.`);
        }
    }
}
