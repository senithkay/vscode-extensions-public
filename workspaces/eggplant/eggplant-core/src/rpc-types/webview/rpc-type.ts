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
import { VisualizerLocation } from "../../extension-interfaces/state-machine-types";
import { BallerinaProjectComponents } from "@wso2-enterprise/ballerina-core";
import { EggplantModel } from "./types";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "webview";
export const getState: RequestType<void, string> = { method: `${_preFix}/getState` };
export const getVisualizerState: RequestType<void, VisualizerLocation> = { method: `${_preFix}/getVisualizerState` };
export const openVisualizerView: NotificationType<VisualizerLocation> = { method: `${_preFix}/openVisualizerView` };
export const getBallerinaProjectComponents: RequestType<void, BallerinaProjectComponents> = { method: `${_preFix}/getBallerinaProjectComponents` };
export const getEggplantModel: RequestType<void, EggplantModel> = { method: `${_preFix}/getEggplantModel` };
