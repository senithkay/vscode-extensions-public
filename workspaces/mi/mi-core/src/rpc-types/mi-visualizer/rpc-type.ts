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
import { HistoryEntry } from "../../history";
import { ColorThemeKind } from "../../state-machine-types";
import { ProjectStructureRequest, ProjectStructureResponse, WorkspacesResponse, OpenViewRequest, HistoryEntryResponse, ToggleDisplayOverviewRequest, GoToSourceRequest } from "./types";
import { GettingStartedData, SampleDownloadRequest } from "./types";
import { RequestType, NotificationType } from "vscode-messenger-common";

const _preFix = "mi-visualizer";
export const getWorkspaces: RequestType<void, WorkspacesResponse> = { method: `${_preFix}/getWorkspaces` };
export const getProjectStructure: RequestType<ProjectStructureRequest, ProjectStructureResponse> = { method: `${_preFix}/getProjectStructure` };
export const getCurrentThemeKind: RequestType<void, ColorThemeKind> = { method: `${_preFix}/getCurrentTheme` };
export const openView: NotificationType<OpenViewRequest> = { method: `${_preFix}/openView` };
export const reloadWindow: RequestType<void, void> = { method: `${_preFix}/reinitialize` };
export const goBack: NotificationType<void> = { method: `${_preFix}/goBack` };
export const fetchSamplesFromGithub: RequestType<void, GettingStartedData> = { method: `${_preFix}/fetchSamplesFromGithub` };
export const downloadSelectedSampleFromGithub: NotificationType<SampleDownloadRequest> = { method: `${_preFix}/downloadSelectedSampleFromGithub` };
export const getHistory: RequestType<void, HistoryEntryResponse> = { method: `${_preFix}/getHistory` };
export const addToHistory: NotificationType<HistoryEntry> = { method: `${_preFix}/addToHistory` };
export const goHome: NotificationType<void> = { method: `${_preFix}/goHome` };
export const goSelected: NotificationType<number> = { method: `${_preFix}/goSelected` };
export const toggleDisplayOverview: RequestType<ToggleDisplayOverviewRequest, void> = { method: `${_preFix}/toggleDisplayOverview` };
export const goToSource: NotificationType<GoToSourceRequest> = { method: `${_preFix}/goToSource` };
