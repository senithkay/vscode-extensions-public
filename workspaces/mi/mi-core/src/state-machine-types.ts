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

export enum MACHINE_VIEW {
    Welcome = "Welcome to MI",
    Overview = "MI Overview",
    Diagram = "MI Diagram",
    ServiceDesigner = "Service Designer",
    APIForm = "API Form",
    EndPointForm = "Endpoint Form",
    SequenceForm = "Sequence Form",
    InboundEPForm = "Inbound EP Form",
    MessageProcessorForm = "MessageProcessorForm",
    ProxyServiceForm = "ProxyServiceForm",
    TaskForm = "Task Form",
    TemplateForm = "TemplateForm",
    HttpEndpointForm = "HttpEndpointForm",
    ProjectCreationForm = "Project Creation Form",
    ImportProjectForm = "Import Project Form",
    LocalEntryForm = "Local Entry Form",
    RegistryResourceForm = "Registry Resource Creation Form",
    MessageStoreForm = "MessageStoreForm",
    ClassMediatorForm = "ClassMediator Creation Form",
}

export enum AI_MACHINE_VIEW {
    AIOverview = "AI Overview",
    AIArtifact = "AI Artifact",
    AIChat = "AI Chat",
}

export type MachineStateValue =
    | 'initialize' | 'projectDetected' | 'LSInit' | 'ready' | 'disabled'
    | { ready: 'viewReady' } | { ready: 'viewEditing' }
    | { newProject: 'viewReady' };

export enum EVENT_TYPE {
    OPEN_VIEW = "OPEN_VIEW",
    FILE_EDIT = "FILE_EDIT",
    EDIT_DONE = "EDIT_DONE",
}

export type VoidCommands = "OPEN_LOW_CODE" | "OPEN_PROJECT" | "CREATE_PROJECT";

export interface MachineEvent {
    type: EVENT_TYPE;
}

export interface CommandProps {
    command: VoidCommands;
    projectName?: string;
    isService?: boolean
}

// State Machine context values
export interface VisualizerLocation {
    view: MACHINE_VIEW | null;
    documentUri?: string;
    projectUri?: string;
    identifier?: string;
    position?: any;
    projectOpened?: boolean;
    customProps?: any;
}

export interface AIVisualizerLocation {
    view: AI_MACHINE_VIEW | null;
}

export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };
export const getVisualizerState: RequestType<void, VisualizerLocation> = { method: 'getVisualizerState' };
export const getAIVisualizerState: RequestType<void, AIVisualizerLocation> = { method: 'getAIVisualizerState' };
export const onFileContentUpdate: NotificationType<void> = { method: `onFileContentUpdate` };
export const webviewReady: NotificationType<void> = { method: `webviewReady` };
