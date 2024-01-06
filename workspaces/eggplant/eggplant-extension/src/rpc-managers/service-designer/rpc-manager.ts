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
    STModification,
    CreateResourceRequest,
    CreateServiceRequest,
    DeleteResourceRequest,
    DeleteServiceRequest,
    ServiceDesignerAPI,
    UpdateResourceRequest,
    UpdateServiceRequest
} from "@wso2-enterprise/ballerina-core";
import { applyModifications, updateFileContent } from "../../utils/modification";
import { StateMachine, openView } from "../../stateMachine";
import { ModulePart, STKindChecker } from "@wso2-enterprise/syntax-tree";

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
}
