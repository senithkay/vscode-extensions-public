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
import { VisualizerAPI, VisualizerLocationContext } from "@wso2-enterprise/ballerina-core";
import { getService, openView, updateView } from "../../stateMachine";
import { handleVisualizerView } from "../../utils/navigation";

export class VisualizerRpcManager implements VisualizerAPI {

    async getVisualizerState(): Promise<VisualizerLocationContext> {
        const snapshot = getService().getSnapshot();
        return new Promise((resolve) => {
            resolve(snapshot.context);
        });
    }

    async openVisualizerView(params: VisualizerLocationContext): Promise<VisualizerLocationContext> {
        return new Promise(async (resolve) => {
            if (params.location) {
                await handleVisualizerView(params.location);
            } else {
                openView(params);
            }
            const snapshot = getService().getSnapshot();
            resolve(snapshot.context);
        });
    }

    async updateVisualizerView(params: VisualizerLocationContext): Promise<VisualizerLocationContext> {
        return new Promise(async (resolve) => {
            updateView(params);
            const snapshot = getService().getSnapshot();
            resolve(snapshot.context);
        });
    }

}
