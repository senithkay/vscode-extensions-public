import { ConfigOverlayFormStatus } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ModulePart, NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

export interface LowCodeDiagramProps extends LowCodeDiagramProperties {
    api?: LowCodeDiagramAPI;
    experimentalEnabled?: boolean;
}

export interface LowCodeDiagramContext {
    state: LowCodeDiagramState;
    actions: LowCodeDiagramActions;
    api?: LowCodeDiagramAPI;
    props: LowCodeDiagramProperties;
}

export interface LowCodeDiagramProperties {
    syntaxTree: STNode;
    isReadOnly: boolean;
    error?: Error;
    selectedPosition?: SelectedPosition;
    // currentAppType: AppType;
    // currentApp: AppInfo;
    // userInfo?: UserState;
    // currentFile: ApplicationFile;
    stSymbolInfo?: STSymbolInfo;
    // connectors?: BallerinaConnectorInfo[];
    // diagnostics?: Diagnostic[];
    // warnings?: Warning[];
    // langServerURL: string;
    // configOverlayFormStatus: ConfigOverlayFormStatus;
    // configPanelStatus: ConfigPanelStatus;
    // isConfigPanelOpen?: boolean;
    // isCodeEditorActive: boolean;
    // isLoadingAST?: boolean;
    // isPerformanceViewOpen: boolean;
    // isLoadingSuccess: boolean;
    isWaitingOnWorkspace?: boolean;
    isMutationProgress?: boolean;
    // isCodeChangeInProgress: boolean;
    // zoomStatus: ZoomStatus;
}

export interface LowCodeDiagramState {
    triggerUpdated: boolean; // FIXME Moving existing prop manipulated in memory into state
    isDataMapperShown: boolean;
    isConfigOverlayFormOpen: boolean;
    // dataMapperConfig: DataMapperConfig;
    targetPosition: NodePosition;
    experimentalEnabled?: boolean;
}

export interface LowCodeDiagramActions {
    updateState: (payload: LowCodeDiagramState) => void;
    diagramCleanDraw: (payload: STNode) => void;
    diagramRedraw: (payload: STNode) => void;
    insertComponentStart: (payload: NodePosition) => void;
    editorComponentStart: (payload: STNode) => void;
    // dataMapperStart: (dataMapperConfig: DataMapperConfig) => void;
    // toggleDiagramOverlay: () => void;
    // updateDataMapperConfig: (dataMapperConfig: DataMapperConfig) => void;
    // setTriggerUpdated: (isUpdated: boolean) => void;
}

export interface LowCodeDiagramAPI {
    edit?: {
        delete?: (targetPosition: NodePosition) => void;
        renderEditForm?: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose: () => void, onSave: () => void) => void;
        renderAddForm?: (targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose: () => void, onSave: () => void) => void;
    };

    // FIXME Doesn't make sense to take these methods below from outside
    // Move these inside and get an external API for pref persistance
    // against a unique ID (eg AppID) for rerender from prev state
    panNZoom?: {
        pan: (panX: number, panY: number) => void;
        fitToScreen: () => void;
        zoomIn: () => void;
        zoomOut: () => void;
    };

    configPanel?: {
        // dispactchConfigOverlayForm: (type: string, targetPosition: NodePosition,
        //                              wizardType: WizardType, blockViewState?: BlockViewState, config?: ConditionConfig,
        //                              symbolInfo?: STSymbolInfo, model?: STNode) => void;
        closeConfigOverlayForm: () => void;
        configOverlayFormPrepareStart: () => void;
        closeConfigPanel: () => void;
    };

    code?: {
        gotoSource: (position: { startLine: number, startColumn: number }) => void;
    }
}

export interface SelectedPosition {
    startLine: number;
    startColumn: number;
}

export interface STSymbolInfo {
    moduleEndpoints: Map<string, STNode>;
    localEndpoints: Map<string, STNode>;
    actions: Map<string, STNode>;
    variables: Map<string, STNode[]>;
    configurables: Map<string, STNode>;
    callStatement: Map<string, STNode[]>;
    variableNameReferences: Map<string, STNode[]>;
    assignmentStatement: Map<string, STNode[]>;
    recordTypeDescriptions: Map<string, STNode>;
    listeners: Map<string, STNode>;
    moduleVariables: Map<string, STNode>;
}

