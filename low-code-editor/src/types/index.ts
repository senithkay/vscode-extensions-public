/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

// TODO Refactor this file.
// Should move these to ../Definitions/*

import { ModulePart, STNode } from "@ballerina/syntax-tree";
import { Diagnostic } from "monaco-languageclient";

import { AiSuggestionsReq, AiSuggestionsRes, AppInfo, ApplicationFile, ConnectorApiResponse } from "../api/models";
import { ConfigPanelStatus, DiagramEditorLangClientInterface, DiagramState, ExpressionEditorLangClientInterface, ExpressionEditorState, Gcalendar, GithubRepo } from "../Definitions";
import { BallerinaConnectorsInfo, STModification } from "../Definitions/lang-client-extended";
import { LowcodeEvent, TriggerType } from "../Diagram/models";

import {
    APIViewState, AppViewState, ConnectionData, Feedback, HomeViewState, LinkerState, Notification, OauthProviderConfigState,
    OauthSessionState, ObserveViewState, SettingsState, UserConfigurations, UserState
} from "./definitions"; // TODO Will need to remove unused definitions later
import {PreferenceState} from "./definitions/preference";
import { TestCaseState } from "./definitions/testcases";

export interface APISortingData {
    columnName: string,
    asc: boolean
}

export interface SortingData {
    columnName: string,
    asc: boolean
}

// AppSplitViews
export interface SplitViewState {
    minimize: boolean;
    dragging: boolean;
    size: number;
    toggleRatio: boolean;
    transitioning: false;
}

export interface AppSplitViews{
    homeHorizontal : SplitViewState,
    homeVertical: SplitViewState,
    obsHorizontal : SplitViewState,
    obsVertical: SplitViewState
    deployHorizontal : SplitViewState
    testVertical: SplitViewState
    testCasesVertical: SplitViewState,
    testCasesEditorVertical: SplitViewState,
    testCasesCodeVertical: SplitViewState,
    testCaseHorizontal: SplitViewState,
    homeLowCodeVertical: SplitViewState
}

export interface LowCodeEditorProps {
    appInfo?: AppViewState;
    zoomStatus?: any;
    isLoadingAST?: boolean;
    isMutationProgress?: boolean;
    isWaitingOnWorkspace?: boolean;
    error?: Error;
    langServerURL?: string;
    getDiagramEditorLangClient?: (url: string) => Promise<DiagramEditorLangClientInterface>;
    getExpressionEditorLangClient?: (url: string) => Promise<ExpressionEditorLangClientInterface>;
    workingFile?: string;
    // syntaxTree: ModulePart | STNode;
    syntaxTree: any;
    originalSyntaxTree?: STNode;
    stSymbolInfo?: STSymbolInfo;
    isCodeEditorActive?: boolean;
    isConfigPanelOpen?: boolean;
    currentApp?: AppInfo;
    currentFile?: ApplicationFile;
    exprEditorState?: ExpressionEditorState;
    diagnostics?: Diagnostic[];
    targetPosition?: any;
    isReadOnly?: boolean;
    dispatch?: (fn: any) => void;
    configPanelStatus?: ConfigPanelStatus;
    connectors?: BallerinaConnectorsInfo[];
    isLoadingSuccess?: boolean;
    connectionData?: ConnectionData;
    userInfo?: UserState;
    onZoomIn?: any;
    onZoomOut?: any;
    onFitToScreen?: any;
    onPanLocation?: any;
    onMutate?: any; // TODO Should be mandotory
    onModify?: any; // TODO Should be mandotory,
    waitOnWorkspaceSuccess?: any;
    waitForCurrentWorkspace?: any;
    getConnectorConfig?: any;
    editComponentStart?: any;
    insertComponentStart?: any;
    getAiSuggestions?: (params: AiSuggestionsReq) => Promise<AiSuggestionsRes>;
    getGsheetList?: any;
    getGcalendarList?: (orgHandle: string, handler: string) => Promise<Gcalendar[]>;
    getGithubRepoList?: (orgHandle: string, handler: string, username: string) => Promise<GithubRepo[]>;
    getLangClientForDiagram?: any;
    oauthSessions?: OauthSessionState;
    dispatchFileChange?: (content: string) => Promise<void>;
    dispatchCodeChangeCommit?: () => Promise<void>;
    onEvent?: (event: LowcodeEvent) => void;
    hasConfigurables?: (templateST: ModulePart) => boolean;
    triggerUpdated?: boolean;
    diagramPanLocation?: (appId: number, panX: number, panY: number) => void,
    createManualConnection?: (orgHandle: string, displayName: string, connectorName: string,
                              userAccountIdentifier: string,
                              tokens: { name: string; value: string }[],
                              selectedType: string) => Promise<ConnectorApiResponse>,
    updateManualConnection?: (activeConnectionId: string, orgHandle: string, displayName: string, connectorName: string,
                              userAccountIdentifier: string, tokens: { name: string; value: string }[],
                              type?: string, activeConnectionHandler?: string) => Promise<ConnectorApiResponse>,
    triggerErrorNotification?: (msg: Error | string) => void,
    triggerSuccessNotification?: (msg: Error | string) => void,
    modifyDiagram?: (mutations: STModification[], options: any) => void,
    modifyTrigger?: (
        triggerType: TriggerType,
        model?: any,
        configObject?: any
    ) => void
}

export interface STSymbolInfo {
    endpoints: Map<string, STNode>;
    actions: Map<string, STNode>;
    variables: Map<string, STNode[]>;
    callStatement: Map<string, STNode[]>;
    variableNameReferences: Map<string, STNode[]>;
}

export interface PortalState {
    userInfo?: UserState;
    appInfo?: AppViewState;
    obsViewState?: ObserveViewState;
    homeViewState?: HomeViewState;
    diagramState?: DiagramState;
    splitViewState?: AppSplitViews;
    error?: Notification;
    preferenceInfo?: PreferenceState;
    feedbackInfo?: Feedback;
    linkerState?: LinkerState;
    oauthProviderConfigs?: OauthProviderConfigState;
    oauthSessions?: OauthSessionState;
    connectionData?: ConnectionData;
    settings?: SettingsState;
    testCasesState?: TestCaseState;
    userConfigurations?: UserConfigurations;
    apiInfo?: APIViewState;
}
