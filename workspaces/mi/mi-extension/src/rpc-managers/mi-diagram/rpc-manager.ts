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
    ApiDirectoryResponse,
    ApplyEditRequest,
    CommandsRequest,
    CommandsResponse,
    ConnectorRequest,
    ConnectorResponse,
    ConnectorsResponse,
    CreateAPIRequest,
    CreateEndpointRequest,
    CreateEndpointResponse,
    CreateSequenceRequest,
    CreateSequenceResponse,
    EndpointDirectoryResponse,
    EndpointsAndSequencesResponse,
    MiDiagramAPI,
    OpenDiagramRequest,
    ProjectStructureRequest,
    ProjectStructureResponse,
    SequenceDirectoryResponse,
    ShowErrorMessageRequest,
    getSTRequest,
    getSTResponse,
} from "@wso2-enterprise/mi-core";
import { StateMachine, openView } from "../../stateMachine";

export class MiDiagramRpcManager implements MiDiagramAPI {
    async executeCommand(params: CommandsRequest): Promise<CommandsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSyntaxTree(params: getSTRequest): Promise<getSTResponse> {
        return new Promise(async (resolve) => {
            const langClient = StateMachine.context().langClient!;
            const res = await langClient.getSyntaxTree({
                documentIdentifier: {
                    uri: params.documentUri
                },
            });
            resolve(res);
        });
    }

    async getConnectors(): Promise<ConnectorsResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getConnector(params: ConnectorRequest): Promise<ConnectorResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getProjectStructure(params: ProjectStructureRequest): Promise<ProjectStructureResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getAPIDirectory(): Promise<ApiDirectoryResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createAPI(params: CreateAPIRequest): Promise<CreateAPIRequest> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async showErrorMessage(params: ShowErrorMessageRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async refresh(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }


    async applyEdit(params: ApplyEditRequest): Promise<boolean> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    };

    async closeWebViewNotification(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async openDiagram(params: OpenDiagramRequest): Promise<void> {

        openView({ fileName: "FILE NAME" });
    }

    async getEndpointDirectory(): Promise<EndpointDirectoryResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createEndpoint(params: CreateEndpointRequest): Promise<CreateEndpointResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getEndpointsAndSequences(): Promise<EndpointsAndSequencesResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getSequenceDirectory(): Promise<SequenceDirectoryResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async createSequence(params: CreateSequenceRequest): Promise<CreateSequenceResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async closeWebView(): Promise<> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async openFile(params: OpenDiagramRequest): Promise<> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }
}
