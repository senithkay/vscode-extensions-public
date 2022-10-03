import { BallerinaConnectorInfo, ConfigOverlayFormStatus, ConnectorWizardProps, DiagramOverlayPosition, LowcodeEvent, PlusWidgetProps, STModification, STSymbolInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { PlusViewState } from "../ViewState";

export interface LowCodeDiagramProps extends LowCodeDiagramProperties {
    api?: LowCodeDiagramAPI;
    experimentalEnabled?: boolean;
}

export interface ZoomStatus {
    scale: number,
    panX: number,
    panY: number,
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
    zoomStatus?: ZoomStatus;
    experimentalEnabled?: boolean;
    onDiagramDoubleClick?: () => void,
}

export interface LowCodeDiagramState {
    triggerUpdated: boolean; // FIXME Moving existing prop manipulated in memory into state
    isDataMapperShown: boolean;
    isConfigOverlayFormOpen: boolean;
    targetPosition: NodePosition; // FIXME check and remove usage of update position if not used anymore
    experimentalEnabled?: boolean;
}

export interface LowCodeDiagramActions {
    updateState: (payload: LowCodeDiagramState) => void;
    diagramCleanDraw: (payload: STNode) => void;
    diagramRedraw: (payload: STNode) => void;
    insertComponentStart: (payload: NodePosition) => void;
    editorComponentStart: (payload: STNode) => void;
}

export interface LowCodeDiagramAPI {
    edit?: {
        deleteComponent?: (model: STNode, onDelete?: () => void) => void;
        renderEditForm?: (model: STNode, targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
        renderAddForm?: (targetPosition: NodePosition, configOverlayFormStatus: ConfigOverlayFormStatus, onClose?: () => void, onSave?: () => void) => void;
        renderConnectorWizard?: (connectorWizardProps: ConnectorWizardProps) => void;
        renderDialogBox?: (type: string, onConfirm: () => void, onCancel?: () => void, position?: DiagramOverlayPosition, overlayId?: string, message?: string, removeText?: string, isFunctionMember?: boolean) => void;
        renderPlusWidget?: (type: string, plusWidgetProps: PlusWidgetProps, viewState?: PlusViewState) => any;
        closeAllOpenedForms?: (callBack?: () => void) => void;
        openPerformanceChart?: (name: string, range: NodePosition, diagramRedrawFunc: any) => void;
        showTooltip?: (
            component: any,
            content?: string,
            onClick?: () => void,
            additionalParams?: any) => any;
        STNode?: STNode;
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
    hasWorker: boolean;
}
