/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NotificationType, RequestType } from "vscode-messenger-common";

export enum MACHINE_VIEW {
    Welcome = "Welcome to API Designer",
    Overview = "Overview"
}

export type MachineStateValue =
    | 'initialize' | 'projectDetected' | 'oldProjectDetected' | 'LSInit' | 'ready' | 'disabled'
    | { ready: 'viewReady' } | { ready: 'viewEditing' }
    | { newProject: 'viewReady' };

export type PopupMachineStateValue = 'initialize' | 'ready' | { open: 'active' } | { ready: 'reopen' } | { ready: 'notify' } | 'disabled';

export enum EVENT_TYPE {
    OPEN_VIEW = "OPEN_VIEW",
    REPLACE_VIEW = "REPLACE_VIEW",
    CLEAR_PROMPT = "CLEAR_PROMPT",
    FILE_EDIT = "FILE_EDIT",
    EDIT_DONE = "EDIT_DONE",
    CLOSE_VIEW = "CLOSE_VIEW"
}


export interface ErrorType {
    title: string;
    message: string;
}

// State Machine context values
export interface VisualizerLocation {
    view: MACHINE_VIEW | null;
    errors?: ErrorType[];
    documentUri?: string;
    projectUri?: string;
    identifier?: string;
    position?: any;
}

export interface PopupVisualizerLocation extends VisualizerLocation {
    recentIdentifier?: string;
}

export interface ParentPopupData {
    recentIdentifier: string;
}

// ------------> Main RPC Methods <-----------
export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };
export const getVisualizerState: RequestType<void, VisualizerLocation> = { method: 'getVisualizerState' };
export const onFileContentUpdate: NotificationType<void> = { method: `onFileContentUpdate` };
export const webviewReady: NotificationType<void> = { method: `webviewReady` };

// ------------> Popup RPC Methods <-----------
export const getPopupVisualizerState: RequestType<void, PopupVisualizerLocation> = { method: 'getPopupVisualizerState' };
export const popupStateChanged: NotificationType<PopupMachineStateValue> = { method: 'popupStateChanged' };
export const onParentPopupSubmitted: NotificationType<ParentPopupData> = { method: `onParentPopupSubmitted` };
