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
    BallerinaSTModifyResponse,
    CompletionParams,
    CompletionResponse,
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    GetSyntaxTreeResponse,
    KeywordTypeResponse,
    RecordSTRequest,
    RecordSTResponse,
    visitor as RecordsFinderVisitor,
    STModification,
    ServiceDesignerAPI,
    UpdateResourceRequest,
    UpdateServiceRequest,
    goToSourceRequest
} from "@wso2-enterprise/ballerina-core";
import { ModulePart, STKindChecker, traversNode } from "@wso2-enterprise/syntax-tree";
import { Uri } from "vscode";
import { applyModifications, updateFileContent } from "../../utils/modification";
import { getLangClient, getService, openView } from "../../visualizer/activator";
import { goToSource } from "../../utils";

export class ServiceDesignerRpcManager implements ServiceDesignerAPI {
    async createService(params: CreateServiceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
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
        const location = getService().getSnapshot().context.location;
        const modification: STModification = {
            type: "INSERT",
            isImport: false,
            config: {
                "STATEMENT": params.source
            },
            ...params.position
        };
        const response = await applyModifications(location.fileName!, [modification]) as BallerinaSTModifyResponse;
        if (response.parseSuccess) {
            await updateFileContent({ fileUri: location.fileName!, content: response.source });
            const st = response.syntaxTree as ModulePart;
            st.members.forEach(member => {
                if (STKindChecker.isServiceDeclaration(member)) {
                    const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                }
                openView({ location: member?.position, view: "ServiceDesigner" });
            });
        }
    }

    async updateResource(params: UpdateResourceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async deleteResource(params: DeleteResourceRequest): Promise<void> {
        const location = getService().getSnapshot().context.location;
        const modification: STModification = {
            type: 'DELETE',
            ...params.position
        };

        const response = await applyModifications(location.fileName!, [modification]) as BallerinaSTModifyResponse;
        if (response.parseSuccess) {
            await updateFileContent({ fileUri: location.fileName!, content: response.source });
            const st = response.syntaxTree as ModulePart;
            st.members.forEach(member => {
                if (STKindChecker.isServiceDeclaration(member)) {
                    const identifier = member.absoluteResourcePath.reduce((result, obj) => result + obj.value, "");
                    // if (identifier === context.identifier) {
                    //     openView({ position: member.position });
                    // }
                }
            });
        }
    }

    async getKeywordTypes(): Promise<KeywordTypeResponse> {
        const location = getService().getSnapshot().context.location;
        const completionParams: CompletionParams = {
            textDocument: {
                uri: Uri.file(location.fileName!).toString()
            },
            context: {
                triggerKind: 25,
            },
            position: {
                character: 0,
                line: 0
            }
        };

        const langClient = getLangClient();
        const completions: CompletionResponse[] = await langClient.getCompletion(completionParams);
        return { completions: completions.filter(value => value.kind === 25) };
    }

    async getRecordST(params: RecordSTRequest): Promise<RecordSTResponse> {
        const location = getService().getSnapshot().context.location;
        const langClient = getLangClient();
        const fileUri = Uri.file(location.fileName!).toString();
        const stResponse = await langClient.getSyntaxTree({ documentIdentifier: { uri: fileUri } }) as GetSyntaxTreeResponse;
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

    async goToSource(params: goToSourceRequest): Promise<void> {
        const location = getService().getSnapshot().context.location;
        goToSource(params.position, location.fileName!);
    }
}
