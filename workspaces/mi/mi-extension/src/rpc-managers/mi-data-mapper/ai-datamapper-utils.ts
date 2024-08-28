
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

export function showMappingEndNotification() {
    const message = "You may freely edit these mappings or try again. \n\n Please note that automatic mapping is powered by AI. Thus, mistakes and surprises are inevitable.";
    let miVisualizerRpcClient: MiVisualizerRpcManager = new MiVisualizerRpcManager();
    miVisualizerRpcClient.retrieveContext({
        key: "showDmLandingMessage",
        contextType: "workspace"
    }).then((response) => {
        if (response.value ?? true) {
            miVisualizerRpcClient.showNotification({
                message: message,
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
