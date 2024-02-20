/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NotificationType, RequestType } from "vscode-messenger-common";

export type MachineViews = "Overview" | "Diagram" | "ServiceDesigner" | "APIForm" | "EndPointForm" | "SequenceForm" | "ProjectCreationForm";

export type MachineStateValue =
    | 'initialize' | 'projectDetected' | 'LSInit' | 'ready' | 'disabled'
    | { ready: 'viewReady' } | { ready: 'viewUpdate' }
    | { newProject: 'welcome' } | { newProject: 'create' };

export type EventType = "OPEN_VIEW" | "GET_STARTED" | "CANCEL_CREATION";

export type VoidCommands = "OPEN_LOW_CODE" | "OPEN_PROJECT" | "CREATE_PROJECT";

export interface MachineEvent {
    type: EventType;
}

export interface CommandProps {
    command: VoidCommands;
    projectName?: string;
    isService?: boolean
}

// State Machine context values
export interface VisualizerLocation {
    view: MachineViews | null;
    documentUri?: string;
    identifier?: string;
    position?: any;
}

export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };
export const getVisualizerState: RequestType<void, VisualizerLocation> = { method: 'getVisualizerState' };
export const onFileContentUpdate: NotificationType<void> = { method: `onFileContentUpdate` };
export const webviewReady: NotificationType<void> = { method: `webviewReady` };
