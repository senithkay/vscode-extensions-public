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

import { BlockViewState } from "..";
import { AiSuggestionsReq, AiSuggestionsRes, AppInfo, ApplicationFile, AppType, ConnectionDetails, ConnectorApiResponse, ModelCodePosition, OauthProviderConfig } from "../api/models";
import { WizardType } from "../ConfigurationSpec/types";
import { ConfigOverlayFormStatus, ConfigPanelStatus, DiagramEditorLangClientInterface, DiagramState, ExpressionEditorLangClientInterface, ExpressionEditorState, Gcalendar, GithubRepo, STSymbolInfo } from "../Definitions";
import { BallerinaConnectorsInfo, Connector, STModification } from "../Definitions/lang-client-extended";
import { ConditionConfig, DataMapperConfig } from "../Diagram/components/Portals/ConfigForm/types";
import { LowcodeEvent, TriggerType } from "../Diagram/models";
import { Warning } from "../Diagram/utils/st-util";
import { DraftInsertPosition, DraftUpdatePosition } from "../Diagram/view-state/draft";

import {
    APIViewState, AppViewState, ConnectionData, Feedback, GSpreadsheet, HomeViewState, LinkerState, Notification, OauthProviderConfigState,
    OauthSessionState, ObserveViewState, SettingsState, UserConfigurations, UserState
} from "./definitions"; // TODO Will need to remove unused definitions later
import {PreferenceState, ZoomStatus} from "./definitions/preference";
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

export interface LowCodeEditorState {
    triggerUpdated: boolean; // FIXME Moving existing prop manipulated in memory into state
    isDataMapperShown: boolean;
    isConfigOverlayFormOpen: boolean;
    dataMapperConfig: DataMapperConfig;
    targetPosition: DraftInsertPosition | DraftUpdatePosition; // FIXME check and remove usage of update position if not used anymore
}

export interface LowCodeEditorActions {
    updateState: (payload: LowCodeEditorState) => void;
    diagramCleanDraw: (payload: STNode) => void;
    diagramRedraw: (payload: STNode) => void;
    insertComponentStart: (payload: DraftInsertPosition) => void;
    editorComponentStart: (payload: STNode) => void;
    dataMapperStart: (dataMapperConfig: DataMapperConfig) => void;
    toggleDiagramOverlay: () => void;
    updateDataMapperConfig: (dataMapperConfig: DataMapperConfig) => void;
    setTriggerUpdated: (isUpdated: boolean) => void;
}

export interface LowCodeEditorAPI {
    tour: {
        goToNextTourStep: (step: string) => void;
    }
    helpPanel: {
        openConnectorHelp: (connector?: Partial<Connector>, method?: string) => void;
    }
    notifications: {
        triggerErrorNotification?: (msg: Error | string) => void;
        triggerSuccessNotification?: (msg: Error | string) => void;
    }
    ls: {
        getDiagramEditorLangClient?: (url: string) => Promise<DiagramEditorLangClientInterface>;
        getExpressionEditorLangClient?: (url: string) => Promise<ExpressionEditorLangClientInterface>;
    }
    // This has to come from Lang-server
    insights: {
        onEvent?: (event: LowcodeEvent) => void;
        trackTriggerSelection: (trigger: string) => void;
    }
    code: {
        modifyDiagram: (mutations: STModification[], options?: any) => void;
        onMutate: (type: string, options: any) => void;
        modifyTrigger: (
            triggerType: TriggerType,
            model?: any,
            configObject?: any
        ) => void;
        dispatchCodeChangeCommit?: () => Promise<void>;
        dispatchFileChange?: (content: string, callback?: () => void) => Promise<void>;
        hasConfigurables?: (templateST: ModulePart) => boolean;
        // Reuse go-to-def from LangServer?
        setCodeLocationToHighlight: (position: ModelCodePosition) => void,
    }
    connections: {
        createManualConnection?: (orgHandle: string, displayName: string, connectorName: string,
                                  userAccountIdentifier: string,
                                  tokens: { name: string; value: string }[],
                                  selectedType: string) => Promise<ConnectorApiResponse>,
        updateManualConnection?: (activeConnectionId: string, orgHandle: string, displayName: string, connectorName: string,
                                  userAccountIdentifier: string, tokens: { name: string; value: string }[],
                                  type?: string, activeConnectionHandler?: string) => Promise<ConnectorApiResponse>,
        getAllConnections(
                        orgHandle: string,
                        connector?: string
                        ): Promise<ConnectionDetails[]>;
    }
    ai: {
        // should moved inside lang-server
        getAiSuggestions?: (params: AiSuggestionsReq) => Promise<AiSuggestionsRes>;
    }
    splitPanel: {
        maximize: (view: string, orientation: string, appId: number | string) => void,
        minimize: (view: string, orientation: string, appId: number | string) => void,
        setPrimaryRatio: (view: string, orientation: string, appId: number | string) => void,
        setSecondaryRatio: (view: string, orientation: string, appId: number | string) => void,
        handleRightPanelContent: (viewName: string) => void
    }
    data: {
        getGsheetList: (orgHandle: string, handler: string) => Promise<GSpreadsheet[]>;
        getGcalendarList?: (orgHandle: string, handler: string) => Promise<Gcalendar[]>;
        getGithubRepoList?: (orgHandle: string, handler: string, username: string) => Promise<GithubRepo[]>;
    }
    oauth: {
        oauthSessions?: OauthSessionState;
        dispatchGetAllConfiguration: (orgHandle?: string) => Promise<any>;
        dispatchFetchConnectionList?: (connector: string, sessionId: string) => void;
        dispatchInitOauthSession?: (sessionId: string, connector: string, oauthProviderConfig?: OauthProviderConfig) => void;
        dispatchResetOauthSession?: (sessionId: string) => void;
        dispatchTimeoutOauthRequest?: (sessionId: string) => void;
        dispatchDeleteOauthSession?: (sessionId: string) => void;
        oauthProviderConfigs?: OauthProviderConfigState;
    }
    // FIXME Doesn't make sense to take these methods below from outside
    // Move these inside and get an external API for pref persistance
    // against a unique ID (eg AppID) for rerender from prev state
    panNZoom: {
        pan: (panX: number, panY: number) => void;
        fitToScreen: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
    };
    configPanel: {
        dispactchConfigOverlayForm: (type: string, targetPosition: DraftInsertPosition,
                                     wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig,
                                     symbolInfo?: STSymbolInfo, model?: STNode) => void;
        closeConfigOverlayForm: () => void;
        configOverlayFormPrepareStart: () => void;
        closeConfigPanel: () => void;
    }
}

// FIXME Some of these props should be moved to low code state
// and need to avoid getting from outside
export interface LowCodeEditorProperties {
    currentAppType: AppType;
    currentApp: AppInfo;
    userInfo?: UserState;
    currentFile: ApplicationFile;
    syntaxTree: STNode;
    originalSyntaxTree: ModulePart;
    stSymbolInfo: STSymbolInfo;
    connectors?: BallerinaConnectorsInfo[];
    diagnostics?: Diagnostic[];
    warnings?: Warning[];
    error?: Error;
    langServerURL: string;
    configOverlayFormStatus: ConfigOverlayFormStatus;
    configPanelStatus: ConfigPanelStatus;
    isConfigPanelOpen?: boolean;
    isCodeEditorActive: boolean;
    isLoadingAST?: boolean;
    isPerformanceViewOpen: boolean;
    isLoadingSuccess: boolean;
    isWaitingOnWorkspace: boolean;
    isMutationProgress: boolean;
    isCodeChangeInProgress: boolean;
    isReadOnly: boolean;
    zoomStatus: ZoomStatus;
}

export interface FunctionProperties {
    overlayId: string;
}

export interface LowCodeEditorContext {
    state: LowCodeEditorState;
    actions: LowCodeEditorActions;
    api: LowCodeEditorAPI;
    props: LowCodeEditorProperties;
}

export interface LowCodeEditorProps extends LowCodeEditorProperties {
    api: LowCodeEditorAPI;
}
export interface LowCodeEditorPropsOld {
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
    diagnostics?: Diagnostic[];
    targetPosition?: any;
    isReadOnly?: boolean;
    dispatch?: (fn: any) => void;
    configPanelStatus?: ConfigPanelStatus;
    connectors?: BallerinaConnectorsInfo[];
    isLoadingSuccess?: boolean;
    userInfo?: UserState;
    onZoomIn?: any;
    onZoomOut?: any;
    fitToScreen?: () => void;
    onPanLocation?: any;
    onMutate?: any; // TODO Should be mandotory
    onModify?: any; // TODO Should be mandotory,
    getAiSuggestions?: (params: AiSuggestionsReq) => Promise<AiSuggestionsRes>;
    getGsheetList?: any;
    getGcalendarList?: (orgHandle: string, handler: string) => Promise<Gcalendar[]>;
    getGithubRepoList?: (orgHandle: string, handler: string, username: string) => Promise<GithubRepo[]>;
    oauthSessions?: OauthSessionState;
    dispatchFileChange?: (content: string) => Promise<void>;
    dispatchCodeChangeCommit?: () => Promise<void>;
    onEvent?: (event: LowcodeEvent) => void;
    hasConfigurables?: (templateST: ModulePart) => boolean;
    triggerUpdated?: boolean;
    diagramPanLocation?: (panX: number, panY: number) => void,
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

export interface STSymbolInfoOld {
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
