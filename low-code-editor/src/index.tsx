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
import React from "react";

import { Provider as DiagramProvider } from "./Contexts/Diagram";
import { STModification } from "./Definitions/lang-client-extended";
import DiagramContainer from "./Diagram/Container";
import { TriggerType } from "./Diagram/models";
import { DiagramErrorBoundary } from "./ErrorBoundrary";
import { LowCodeEditorProps as Props } from "./types";
import { init as formFieldIndexDB } from './utils/idb';

export { LowCodeEditorProps, PortalState } from "./types";
export {
    BallerinaConnectorRequest,
    BallerinaConnectorResponse,
    BallerinaConnectorsResponse,
    BallerinaRecordRequest,
    BallerinaRecordResponse,
    BallerinaSTModifyRequest,
    BallerinaSTModifyResponse,
    BallerinaSyntaxTreeModifyRequest,
    BallerinaSyntaxTreeResponse,
    GetSyntaxTreeParams,
    GetSyntaxTreeResponse,
    TriggerModifyRequest,
    BallerinaProjectParams,
    CompletionParams,
    CompletionResponse,
    defaultInitParams,
    DidChangeParams,
    DidCloseParams,
    DidOpenParams,
    initParams,
    PublishDiagnosticsParams,
    BaseLangClientInterface,
    DiagramEditorLangClientInterface,
    ExpressionEditorLangClientInterface,
    ExpressionTypeRequest,
    ExpressionTypeResponse,
    ExpressionEditorState,
    DiagramSize,
    DiagramState,
    ConfigPanelStatus,
    STSymbolInfo,
    ConfigOverlayFormStatus as ConfigOverlayFormStatusDef
} from "./Definitions";
export { Diagram } from "./Diagram";
export {
    getDiagnosticsFromVisitor,
    getLowCodeSTFn,
    getLowCodeSTFnSelected,
    sizingAndPositioningST,
    recalculateSizingAndPositioningST
} from './Diagram/utils/st-util';
export { visitor as initVisitor } from "./Diagram/visitors/init-visitor";
export { visitor as positionVisitor } from "./Diagram/visitors/positioning-visitor";
export { visitor as sizingVisitor } from "./Diagram/visitors/sizing-visitor";
export { cleanAll, getSymbolInfo, visitor as SymbolVisitor } from "./Diagram/visitors/symbol-finder-visitor";
export { BlockViewState } from './Diagram/view-state';
export { DraftInsertPosition } from './Diagram/view-state/draft';
export { ConfigPanel, CONFIG_PANEL_PORTAL_DIV_ID } from "./Diagram/components/ConfigPanel";
export { getTriggerSource, getSampleSource } from "./Diagram/utils/template-utils";
export { InsertorDelete } from "./Diagram/utils/modification-util";

export default function LowCodeEditor(props: Props) {

    const {
        langServerURL,
        workingFile,
        currentApp,
        exprEditorState,
        ...restProps
    } = props;

    const initialState = {
        ...restProps,
        currentApp
    }

    const onMutate = (mutations: STModification[]) => {
        // TODO Can move to upper scope. Should do later.
        props.onMutate(langServerURL, "file://" + workingFile, mutations);
    }

    const onModifyTrigger = (triggerType: TriggerType, model?: any, configObject?: any) => {
        // TODO Can move to upper scope. Should do later.
        props.onModify(triggerType, model, configObject);
    }

    const diagramProps = {
        ...props,
        onMutate,
        onModifyTrigger
    };

    // Initialized form field IndexedDB
    formFieldIndexDB();

    return (
        <DiagramErrorBoundary>
            <DiagramProvider initialState={initialState} >
                <div>
                    <DiagramContainer {...diagramProps} />
                </div>
            </DiagramProvider>
        </DiagramErrorBoundary>
    );
}
