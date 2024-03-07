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
import { NotificationType } from "vscode-messenger-common";
import { CommandProps, MachineEvent, VisualizerLocation } from "../../state-machine-types";

const _preFix = "visualizer";
export const openView: NotificationType<VisualizerLocation> = { method: `${_preFix}/openView` };
export const goBack: NotificationType<void> = { method: `${_preFix}/goBack` };
export const sendMachineEvent: NotificationType<MachineEvent> = { method: `${_preFix}/sendMachineEvent` };
export const executeCommand: NotificationType<CommandProps> = { method: `${_preFix}/executeCommand` };
