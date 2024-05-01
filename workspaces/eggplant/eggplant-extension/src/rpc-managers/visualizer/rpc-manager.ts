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
    CommandProps,
    MachineEvent,
    VisualizerAPI,
    VisualizerLocation
} from "@wso2-enterprise/eggplant-core";
import { StateMachine, getPreviousView, openView } from "../../stateMachine";
import { commands } from "vscode";
import { createEggplantProject, openEggplantProject } from "../../utils/project";
import { PALETTE_COMMANDS } from "../../eggplantExtentionContext";

export class VisualizerRpcManager implements VisualizerAPI {
    async openView(params: VisualizerLocation): Promise<void> {
        return new Promise(async (resolve) => {
            openView("OPEN_VIEW", params);
            resolve();
        });
    }

    goBack(): void {
         // Get current view
         const currentView = StateMachine.context().view;
         const currentDoc = StateMachine.context().documentUri;
         const view = getPreviousView(currentView!);
         view.length > 0 && openView("OPEN_VIEW", { view: view[0], documentUri: currentDoc });
    }

    async sendMachineEvent(params: MachineEvent): Promise<void> {
        StateMachine.sendEvent(params.type);
    }

    executeCommand(params: CommandProps): void {
        switch (params.command) {
            case "OPEN_LOW_CODE":
                commands.executeCommand(PALETTE_COMMANDS.SHOW_VISUALIZER);
                break;
            case "OPEN_PROJECT":
                openEggplantProject();
                break;
            case "CREATE_PROJECT":
                createEggplantProject(params.projectName!, params.isService!);
                break;
            default:
                break;
        }
    }
}
