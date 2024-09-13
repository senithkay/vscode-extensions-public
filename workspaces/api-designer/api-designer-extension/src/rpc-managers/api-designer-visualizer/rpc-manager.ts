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
    APIDesignerVisualizerAPI,
    GetOpenAPIContentRequest,
    GetOpenAPIContentResponse,
    GoToSourceRequest,
    HistoryEntry,
    HistoryEntryResponse,
    OpenViewRequest
} from "@wso2-enterprise/api-designer-core";
import { readFile } from 'fs/promises';
export class ApiDesignerVisualizerRpcManager implements APIDesignerVisualizerAPI {
    async openView(params: OpenViewRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async goBack(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getHistory(): Promise<HistoryEntryResponse> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async addToHistory(params: HistoryEntry): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async goHome(): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async goToSource(params: GoToSourceRequest): Promise<void> {
        // ADD YOUR IMPLEMENTATION HERE
        throw new Error('Not implemented');
    }

    async getOpenApiContent(params: GetOpenAPIContentRequest): Promise<GetOpenAPIContentResponse> {
        // Read the file content from the file system
        let fileType : 'json' | 'yaml' | undefined;
        let fileContent;
        if (!params.filePath) {
            console.error('File path is not provided');
        } else if (params.filePath.endsWith('.json')) {
            fileType = 'json';
        } else if (params.filePath.endsWith('.yaml') || params.filePath.endsWith('.yml')) {
            fileType = 'yaml';
        } else {
            console.error('Unsupported file type');
        }
        try {
            fileContent = await readFile(params.filePath, 'utf8');
        } catch (err: any) {
            if (err.code === 'ENOENT') {
                console.error('File does not exist.');
            } else {
                console.error('Error reading file:', err);
            }
        }
        return { content: fileContent, type: fileType };
    }
}
