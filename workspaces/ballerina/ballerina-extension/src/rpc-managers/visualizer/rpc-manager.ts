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
    VisualizerAPI,
    VisualizerLocation
} from "@wso2-enterprise/ballerina-core";
import { StateMachine, getPreviousView, openView } from "../../stateMachine";
import { handleVisualizerView } from "../../utils/navigation";

export class VisualizerRpcManager implements VisualizerAPI {
   
    openView(params: VisualizerLocation): Promise<void> {
        return new Promise(async (resolve) => {
            if (params.position) {
                await handleVisualizerView(params);
            } else {
                openView("OPEN_VIEW", params);
            }
            resolve();
        });
    }

    goBack(): void{
        // Get current view
        const currentView = StateMachine.context().view;
        const currentDoc = StateMachine.context().documentUri;
        const view = getPreviousView(currentView!);
        view.length > 0 && openView("OPEN_VIEW", { view: view[0], documentUri: currentDoc });
    }
}
