import { ConfigOverlayFormStatus, ConnectorConfigWizardProps, LowcodeEvent, PerformanceData, STModification, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

export interface LowCodeDiagramProps extends LowCodeDiagramProperties {
    api?: LowCodeDiagramAPI;
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
    stSymbolInfo?: STSymbolInfo;
    isCodeEditorActive?: boolean;
    isWaitingOnWorkspace?: boolean;
    isMutationProgress?: boolean;
    performanceData?: Map<string, PerformanceData>;
    // isDiagramLoading?: boolean;
}

export interface LowCodeDiagramState {
    triggerUpdated: boolean; // FIXME Moving existing prop manipulated in memory into state
    isDataMapperShown: boolean;
    isConfigOverlayFormOpen: boolean;
    // dataMapperConfig: DataMapperConfig;
    targetPosition: NodePosition; // FIXME check and remove usage of update position if not used anymore
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
        deleteComponent?: (model: STNode, onDelete?: () => void) => void;
        renderEditForm?: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
        renderAddForm?: (targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
        renderConnectorWizard?: (connectorConfigWizardProps: ConnectorConfigWizardProps) => void;
        closeAllOpenedForms?: (callBack?: () => void) => void;
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
        modifyDiagram?: (mutations: STModification[], options?: any) => void;
        gotoSource?: (position: { startLine: number, startColumn: number }) => void;
    };

    webView?: {
        showSwaggerView?: (serviceName: string) => void;
        showDocumentationView?: (url: string) => void;
    };

    project?: {
        run: (args: any[]) => void;
    };

    insights?: {
        onEvent?: (event: LowcodeEvent) => void;
    }
}

export interface SelectedPosition {
    startLine: number;
    startColumn: number;
}

export interface FunctionProperties {
    overlayId: string;
    overlayNode: HTMLDivElement;
    functionNode: STNode;
}
