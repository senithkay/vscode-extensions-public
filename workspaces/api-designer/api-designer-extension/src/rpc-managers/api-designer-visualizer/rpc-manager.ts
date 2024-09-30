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
    OpenViewRequest,
    WriteOpenAPIContentRequest,
    WriteOpenAPIContentResponse
} from "@wso2-enterprise/api-designer-core";
import { readFile, writeFile } from 'fs/promises';
import yaml from 'js-yaml';
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

    async writeOpenApiContent(params: WriteOpenAPIContentRequest): Promise<WriteOpenAPIContentResponse> {
        const { filePath, content } = params;
        if (!filePath) {
            throw new Error('File path is not provided');
        }
        try {
            let formattedContent: string;

            if (filePath.endsWith('.json')) {
                // Parse and stringify JSON with formatting
                const jsonObject = JSON.parse(content);
                formattedContent = JSON.stringify(jsonObject, null, 2);
            } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
                // Parse and dump YAML with formatting
                const yamlObject = yaml.load(content);
                formattedContent = yaml.dump(yamlObject, {
                    indent: 2,
                    lineWidth: -1, // Disable line wrapping
                    noRefs: true,
                });
            } else {
                throw new Error('Unsupported file type');
            }

            await writeFile(filePath, formattedContent, 'utf8');
            return { success: true };
        } catch (err: any) {
            console.error('Error writing file:', err);
            return { success: false };
        }
    }
}
