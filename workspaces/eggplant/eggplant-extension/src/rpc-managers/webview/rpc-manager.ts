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
    LangClientInterface,
    VisualizerLocation,
    WebviewAPI,
} from "@wso2-enterprise/eggplant-core";
import { openView, stateService } from "../../stateMachine";
import { handleVisualizerView } from "../../utils/navigation";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { workspace } from "vscode";

export class WebviewRpcManager implements WebviewAPI {

    async getVisualizerState(): Promise<VisualizerLocation> {
        const snapshot = stateService.getSnapshot();
        snapshot.context.langServer = null;
        return new Promise((resolve) => {
            resolve(snapshot.context);
        });
    }

    openVisualizerView(params: VisualizerLocation): void {
        if (params.location) {
            handleVisualizerView(params.location);
        } else {
            openView(params);
        }
    }

    async getBallerinaProjectComponents(): Promise<BallerinaProjectComponents> {
        const snapshot = stateService.getSnapshot();
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceUri: { uri: string }[] = [];
            workspace.workspaceFolders.forEach(folder => {
                workspaceUri.push(
                    {
                        uri: folder.uri.toString(),
                    }
                );
            });
            const context =  snapshot.context;
            const langClient = context.langServer as LangClientInterface;
            return langClient.getBallerinaProjectComponents({
                documentIdentifiers: workspaceUri
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }
}
