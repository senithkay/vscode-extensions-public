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

import { CallStatement, FunctionCall, QualifiedNameReference, STKindChecker, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { WizardType } from "../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getOverlayFormConfig } from "../../utils/diagram-util";
import { BlockViewState, StatementViewState } from "../../view-state";
import { DraftInsertPosition, DraftStatementViewState } from "../../view-state/draft";
import { ProcessConfigForm } from "../ConfigForms/ProcessConfigForms";
import { DeleteBtn } from "../DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_OFFSET, DELETE_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../DiagramActions/EditBtn";
import { EDIT_SVG_HEIGHT_WITH_SHADOW, EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/EditBtn/EditSVG";

import { ProcessSVG, PROCESS_SVG_HEIGHT, PROCESS_SVG_HEIGHT_WITH_SHADOW, PROCESS_SVG_SHADOW_OFFSET, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW, PROCESS_SVG_WIDTH_WITH_SHADOW } from "./ProcessSVG";
import "./style.scss";

export interface ProcessorProps {
    model: STNode;
    blockViewState?: BlockViewState;
}

export function DataProcessor(props: ProcessorProps) {
    const { state, diagramCleanDraw } = useContext(DiagramContext);
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
        currentApp,
        isCodeEditorActive
    } = state
    const { id: appId } = currentApp || {};

    const { model, blockViewState } = props;
    const [configOverlayFormState, updateConfigOverlayFormState] = useState(undefined);
    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);

    const viewState: StatementViewState = model === null ? blockViewState.draft[1] : model.viewState;
    const isDraftStatement: boolean = blockViewState
        && blockViewState.draft[1] instanceof DraftStatementViewState;
    let processType = "STATEMENT";
    let processName = "Variable";
    let sourceSnippet = "Source";

    let isIntializedVariable = false;
    let isLogStmt = false;

    let isReferencedVariable = false;

    if (model) {
        processType = "Variable";
        sourceSnippet = model.source;
        if (STKindChecker.isCallStatement(model)) {
            const callStatement: CallStatement = model as CallStatement;
            const stmtFunctionCall: FunctionCall = callStatement.expression as FunctionCall;
            const nameRef: QualifiedNameReference = stmtFunctionCall.functionName as QualifiedNameReference;
            if (nameRef?.modulePrefix.value === "log") {
                processType = "Log";
                processName = processType;
                isLogStmt = true;
            } else {
                processName = "Call";
            }
            // todo : uncomment
            // const expressionStmt = ASTUtil.genSource(model).replace(";", "");
            // if (expressionStmt.includes("log")) {
            //     processType = "Log";
            // }
            //
            // if (expressionStmt === "") {
            //     const stmt: ExpressionStatement = model as ExpressionStatement;
            //     const expr: Invocation = stmt.expression as Invocation;
            //     if (expr.definition) {
            //         for (const def of expr.definition) {
            //             if (def[0] === "log") {
            //                 processType = "Log";
            //                 break;
            //             }
            //         }
            //     }
            // }
        } else if (STKindChecker.isLocalVarDecl(model)) {
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
            if (STKindChecker.isSimpleNameReference(model?.varRef)) {
                processName = model?.varRef?.name?.value
            }
        }
    } else if (isDraftStatement) {
        const draftViewState = blockViewState.draft[1] as DraftStatementViewState;
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

    const onCancel = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    const onSave = () => {
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    // let exsitingWizard: ReactNode = null;
    const onProcessClick = () => {
        if (processType !== "PROCESS") {
            const position: DraftInsertPosition = {
                column: model.position.startColumn,
                line: model.position.startLine
            };
            const config = {
                type: processType
            }
            const overlayFormConfig = getOverlayFormConfig(processType, model.position, WizardType.EXISTING,
                blockViewState, undefined, stSymbolInfo, model);
            updateConfigOverlayFormState(overlayFormConfig);
            setConfigWizardOpen(true);
            openNewProcessorConfig(processType, position, WizardType.EXISTING, model.viewState, config, stSymbolInfo, model);
        }
    };

    const onClickOpenInCodeView = () => {
        maximizeCodeView("home", "vertical", appId);
        setCodeToHighlight(model.position)
    }

    const toolTip = isReferencedVariable ? "Variable is referred in the code below" : undefined;
    // If only processor is a initialized variable or log stmt or draft stmt Show the edit btn other.
    // Else show the delete button only.
    const editAndDeleteButtons = (isIntializedVariable || isLogStmt || isDraftStatement) ? (
        <>
            <g className={isReferencedVariable ? "disable" : ""}>
                <DeleteBtn
                    model={model}
                    cx={viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET}
                    cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2)}
                    toolTipTitle={toolTip}
                    isButtonDisabled={isReferencedVariable}
                    onDraftDelete={onDraftDelete}
                />
            </g>
            <EditBtn
                model={model}
                cx={viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET}
                cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2)}
                onHandleEdit={onProcessClick}
            />
        </>
    ) : (
            <>
                <g className={isReferencedVariable ? "disable" : ""}>
                    <DeleteBtn
                        model={model}
                        cx={viewState.bBox.cx - DELETE_SVG_OFFSET}
                        cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2)}
                        toolTipTitle={toolTip}
                        isButtonDisabled={isReferencedVariable}
                        onDraftDelete={onDraftDelete}
                    />
                </g>
            </>
        );

    const processWrapper = isDraftStatement ? cn("main-process-wrapper active-data-processor") : cn("main-process-wrapper data-processor");
    const component: React.ReactNode = (!viewState.collapsed &&
        (
            <g>
                <g className={processWrapper} data-testid="data-processor-block" >
                    <React.Fragment>
                        <ProcessSVG
                            x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            processType={processType}
                            varName={variableName}
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

                                {model === null && blockViewState && blockViewState.draft && isDraftStatement && configOverlayFormState &&
                                    <ProcessConfigForm
                                        position={{
                                            x: viewState.bBox.cx + PROCESS_SVG_WIDTH,
                                            y: viewState.bBox.cy,
                                        }}
                                        wizardType={WizardType.NEW}
                                        onCancel={onCancel}
                                        onSave={onSave}
                                        configOverlayFormStatus={configOverlayFormState}
                                    />
                                }

                                {model && isConfigWizardOpen && configOverlayFormState &&
                                    <ProcessConfigForm
                                        position={{
                                            x: viewState.bBox.cx + PROCESS_SVG_WIDTH,
                                            y: viewState.bBox.cy,
                                        }}
                                        wizardType={WizardType.EXISTING}
                                        onCancel={onCancel}
                                        onSave={onSave}
                                        configOverlayFormStatus={configOverlayFormState}
                                    />
                                }
                                {!isConfigWizardOpen && (
                                    <>
                                        <rect
                                            x={cx + (PROCESS_SVG_WIDTH / 7)}
                                            y={cy + (PROCESS_SVG_HEIGHT / 3)}
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
