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
// tslint:disable: jsx-no-multiline-js align  jsx-wrap-multiline
import React, { useContext, useState } from "react";

import { LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { BallerinaConnectorsInfo } from "../../../../../src/Definitions";
import { WizardType } from "../../../../ConfigurationSpec/types";
import { Context } from "../../../../Contexts/Diagram";
import { getOverlayFormConfig, getRandomInt } from "../../../utils/diagram-util";
import { getMatchingConnector } from "../../../utils/st-util";
import { BlockViewState, StatementViewState } from "../../../view-state";
import { DraftStatementViewState } from "../../../view-state/draft";
import { DefaultConfig } from "../../../visitors/default";
import { ConnectorConfigWizard } from "../../ConnectorConfigWizard";
import { DeleteBtn } from "../../DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_WIDTH_WITH_SHADOW } from "../../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../DiagramActions/EditBtn";
import { EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../../DiagramActions/EditBtn/EditSVG";
import { VariableName, VARIABLE_NAME_WIDTH } from "../../VariableName";

import { ProcessSVG, PROCESS_SVG_HEIGHT, PROCESS_SVG_HEIGHT_WITH_SHADOW, PROCESS_SVG_SHADOW_OFFSET, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW } from "./ProcessSVG";
import "./style.scss";

export interface ProcessorProps {
    model: STNode;
    blockViewState?: BlockViewState;
}

export function ActionProcessor(props: ProcessorProps) {
    const { state, diagramCleanDraw } = useContext(Context);
    const {
        syntaxTree,
        stSymbolInfo,
        isMutationProgress,
        isWaitingOnWorkspace,
        isReadOnly,
        dispactchConfigOverlayForm: openNewProcessorConfig,
        closeConfigOverlayForm: dispatchCloseConfigOverlayForm,
        maximize: maximizeCodeView,
        setCodeLocationToHighlight: setCodeToHighlight,
        handleRightPanelContent,
        currentApp,
        isCodeEditorActive,
        connectors
    } = state
    const { id: appId } = currentApp || {};

    const { model, blockViewState } = props;
    const [configOverlayFormState, updateConfigOverlayFormState] = useState(undefined);
    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);

    const viewState: StatementViewState = model === null ? blockViewState.draft[1] : model.viewState;
    const isDraftStatement: boolean = blockViewState
        && blockViewState.draft[1] instanceof DraftStatementViewState;
    let draftViewState: DraftStatementViewState = viewState as DraftStatementViewState;
    let processType = "Action";
    let processName = "Variable";
    let sourceSnippet = "Source";

    let isIntializedVariable = false;
    const isLogStmt = false;

    let isReferencedVariable = false;

    if (model) {
        processType = "Variable";
        sourceSnippet = model.source;
        if (STKindChecker.isLocalVarDecl(model)) {
            const typedBindingPattern = model?.typedBindingPattern;
            const bindingPattern = typedBindingPattern?.bindingPattern;
            if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
                processName = bindingPattern?.variableName?.value;
                isReferencedVariable = stSymbolInfo?.variableNameReferences?.size && stSymbolInfo.variableNameReferences.get(processName)?.length > 0;
            } else if (STKindChecker.isListBindingPattern(bindingPattern)) {
                // TODO: handle this type binding pattern.
            } else if (STKindChecker.isMappingBindingPattern(bindingPattern)) {
                // TODO: handle this type binding pattern.
            }

            if (model?.initializer && !STKindChecker.isImplicitNewExpression(model?.initializer)) {
                isIntializedVariable = true;
            }
        } else if (STKindChecker.isAssignmentStatement(model)) {
            processType = "Custom";
            processName = "Assignment";
            if (STKindChecker.isSimpleNameReference(model?.varRef)) {
                processName = model?.varRef?.name?.value
            }
        }
    } else if (isDraftStatement) {
        draftViewState = blockViewState.draft[1] as DraftStatementViewState;
        processType = draftViewState.subType;
    }

    const h: number = viewState.dataProcess.h;
    const w: number = viewState.dataProcess.w;
    const cx: number = blockViewState ? (viewState.bBox.cx - (PROCESS_SVG_WIDTH / 2)) : (viewState.bBox.cx - (w / 2));
    const cy: number = viewState.bBox.cy;
    const variableName = (model === null ? "New " + processType : processName);

    React.useEffect(() => {
        if (model === null && blockViewState) {
            const draftVS = blockViewState.draft[1];
            dispatchCloseConfigOverlayForm();
            const overlayFormConfig = getOverlayFormConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            updateConfigOverlayFormState(overlayFormConfig);
            openNewProcessorConfig(draftVS.subType, draftVS.targetPosition,
                WizardType.NEW, blockViewState, undefined, stSymbolInfo);
        }
    }, []);

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
            dispatchCloseConfigOverlayForm();
        }
    };

    const onWizardClose = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setIsConnectorEdit(false);
    };

    const onSave = () => {
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    const connectorsCollection: BallerinaConnectorsInfo[] = [];
    if (connectors) {
        connectors.forEach((connectorInfo: any) => {
            connectorsCollection.push(connectorInfo);
        });
    }

    const [isEditConnector, setIsConnectorEdit] = useState<boolean>(false);
    const [connector, setConnector] = useState<BallerinaConnectorsInfo>(draftViewState.connector);

    // let exsitingWizard: ReactNode = null;
    const toggleSelection = () => {
        const connectorInit: LocalVarDecl = model as LocalVarDecl;
        setConnector(getMatchingConnector(connectorInit, connectors, stSymbolInfo));
        setIsConnectorEdit(!isEditConnector);
    };

    const onClickOpenInCodeView = () => {
        maximizeCodeView("home", "vertical", appId);
        handleRightPanelContent('Code');
        setCodeToHighlight(model.position)
    }

    const toolTip = isReferencedVariable ? "Variable is referred in the code below" : undefined;
    // If only processor is a initialized variable or log stmt or draft stmt Show the edit btn other.
    // Else show the delete button only.
    const editAndDeleteButtons = (
        <>
            <g className={isReferencedVariable ? "disable" : ""}>
                <DeleteBtn
                    model={model}
                    cx={viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW) + PROCESS_SVG_WIDTH / 4}
                    cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 3)}
                    toolTipTitle={toolTip}
                    isButtonDisabled={isReferencedVariable}
                    onDraftDelete={onDraftDelete}
                />
            </g>
            <EditBtn
                model={model}
                cx={viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET}
                cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 4)}
                onHandleEdit={toggleSelection}
            />
        </>
    );

    const processWrapper = isDraftStatement ? cn("main-process-wrapper active-data-processor") : cn("main-process-wrapper data-processor");
    const component: React.ReactNode = (!viewState.collapsed &&
        (
            <g>
                <g className={processWrapper} data-testid="data-processor-block" >
                    <React.Fragment>
                        {!isDraftStatement &&
                            (
                                <VariableName
                                    processType={processType}
                                    variableName={processName}
                                    x={cx - (VARIABLE_NAME_WIDTH + DefaultConfig.textAlignmentOffset)}
                                    y={cy + PROCESS_SVG_HEIGHT / 4}
                                    key_id={getRandomInt(1000)}
                                />
                            )
                        }
                        <ProcessSVG
                            x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            varName={variableName}
                            processType={processType}
                            sourceSnippet={sourceSnippet}
                            position={model?.position}
                            openInCodeView={!isReadOnly && !isCodeEditorActive && !isWaitingOnWorkspace && model && model.position && appId && onClickOpenInCodeView}
                        />
                        {!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace &&
                            <g
                                className="process-options-wrapper"
                                height={PROCESS_SVG_HEIGHT_WITH_SHADOW}
                                width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW}
                                x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                                y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            >
                                <g>
                                    {((model === null || isEditConnector)) && (
                                        <ConnectorConfigWizard
                                            connectorInfo={connector}
                                            position={{
                                                x: viewState.bBox.cx + 80,
                                                y: viewState.bBox.cy,
                                            }}
                                            targetPosition={draftViewState.targetPosition}
                                            selectedConnector={draftViewState.selectedConnector}
                                            model={model}
                                            onClose={onWizardClose}
                                            isAction={true}
                                        />
                                    )}
                                </g>
                                {!isConfigWizardOpen && (
                                    <>
                                        <rect
                                            x={cx + (PROCESS_SVG_WIDTH / 6.5)}
                                            y={cy + (PROCESS_SVG_HEIGHT / 3)}
                                            rx="7"
                                            className="process-rect"
                                        />

                                        {editAndDeleteButtons}
                                    </>
                                )}
                            </g>
                        }
                    </React.Fragment>

                </g>
            </g>
        )
    );

    return (
        <g>
            {component}
        </g>

    );
}
