
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 */
import path = require("path");
import { MiDiagramRpcManager } from "../mi-diagram/rpc-manager";
import { MiVisualizerRpcManager } from "../mi-visualizer/rpc-manager";
import { Project, QuoteKind } from "ts-morph";

export async function fetchBackendUrl() {
    try {
        let miDiagramRpcManager: MiDiagramRpcManager = new MiDiagramRpcManager();
        const { url } = await miDiagramRpcManager.getBackendRootUrl();
        return url;
        // Do something with backendRootUri
    } catch (error) {
        console.error('Failed to fetch backend URL:', error);
    }
}

export function openSignInView() {
    let miDiagramRpcClient: MiDiagramRpcManager = new MiDiagramRpcManager();
    miDiagramRpcClient.executeCommand({ commands: ["MI.openAiPanel"] });
}

// Function to remove the mapFunction line from the TypeScript file
export function removeMapFunctionEntry(content: string): string {
    const project = new Project({
        useInMemoryFileSystem: true,
        manipulationSettings: {
            quoteKind: QuoteKind.Single
        }
    });
    // Create a temporary TypeScript file with the content of the source file
    const sourceFile = project.createSourceFile('temp.ts', content);
    // Get the mapFunction from the source file
    const mapFunction = sourceFile.getFunction('mapFunction');
    if (!mapFunction) {
        throw new Error('mapFunction not found in TypeScript file.');
    }
    let functionContent;
    if (mapFunction.getBodyText()) {
        // Get the function body text and remove any leading or trailing whitespace
        functionContent = mapFunction.getBodyText()?.trim();
    }
    else {
        throw new Error('No function body text found for mapFunction in TypeScript file.');
    }
    // Remove the mapFunction line from the source file
    sourceFile.removeText(mapFunction.getPos(), mapFunction.getEnd());
    return functionContent;
}

// Function to make a request to the backend to get the data mapping
export async function makeRequest(url: string, token: string, tsContent: string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ts_file: tsContent })
    });
    if (!response.ok) throw new Error(`Error while checking token: ${response.statusText}`);
    return response.json();
}

export function showMappingEndNotification() {
    const message = "You may freely edit these mappings or try again. \n\n Please note that automated mapping is powered by AI. Thus, mistakes and surprises are inevitable.";
    let miVisualizerRpcClient: MiVisualizerRpcManager = new MiVisualizerRpcManager();
    miVisualizerRpcClient.retrieveContext({
        key: "showDmLandingMessage",
        contextType: "workspace"
    }).then((response) => {
        if (response.value ?? true) {
            miVisualizerRpcClient.showNotification({
                message: message,
                options: ["Don't show this again"],
                type: "info",
            }).then((response) => {
                if (response.selection) {
                    miVisualizerRpcClient.updateContext({
                        key: "showDmLandingMessage",
                        value: false,
                        contextType: "workspace"
                    });
                }
            });
        }
    });
};

export function showSignedOutNotification() {
    const message = "Account not found. \n\n Please sign in and try again.";
    let miVisualizerRpcClient: MiVisualizerRpcManager = new MiVisualizerRpcManager();
    miVisualizerRpcClient.retrieveContext({
        key: "showDmLandingMessage",
        contextType: "workspace"
    }).then((response) => {
        if (response.value ?? true) {
            miVisualizerRpcClient.showNotification({
                message: message,
                options: [],
                type: "info",
            }).then((response) => {
                if (response.selection) {
                    miVisualizerRpcClient.updateContext({
                        key: "showDmLandingMessage",
                        value: false,
                        contextType: "workspace"
                    });
                }
            });
        }
    });
};
