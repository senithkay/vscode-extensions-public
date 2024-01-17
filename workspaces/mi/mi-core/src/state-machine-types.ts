/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NotificationType } from "vscode-messenger-common";

export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner" | "DataMapper";

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

export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };