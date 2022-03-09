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

import { ConfigOverlayFormStatus, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ActionStatement,
    AssignmentStatement,
    CallStatement,
    FunctionCall,
    LocalVarDecl,
    NodePosition,
    QualifiedNameReference,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { DeleteBtn } from "../../../Components/DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../../Components/DiagramActions/EditBtn";
import { EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/EditBtn/EditSVG";
import { Context } from "../../../Context/diagram";
import { getDiagnosticInfo, getMethodCallFunctionName, getOverlayFormConfig, getRandomInt, getStatementTypesFromST } from "../../../Utils";
import { BlockViewState, StatementViewState } from "../../../ViewState";
import { DraftStatementViewState } from "../../../ViewState/draft";
import { DefaultConfig } from "../../../Visitors/default";
import { Assignment } from "../Assignment";
import { MethodCall } from "../MethodCall";
import { StatementTypes } from "../StatementTypes";
import { VariableName, VARIABLE_NAME_WIDTH } from "../VariableName";

import { ProcessSVG, PROCESS_SVG_HEIGHT, PROCESS_SVG_HEIGHT_WITH_SHADOW, PROCESS_SVG_SHADOW_OFFSET, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW } from "./ProcessSVG";
import "./style.scss";

export interface ProcessorProps {
    model: STNode;
    blockViewState?: BlockViewState;
}

export function DataProcessor(props: ProcessorProps) {
    const diagramContext = useContext(Context);
    const gotoSource = diagramContext?.api?.code?.gotoSource;
    const renderAddForm = diagramContext?.api?.edit?.renderAddForm;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;
    const {
        syntaxTree,
        stSymbolInfo,
        isReadOnly,
    } = diagramContext.props;
    const { diagramCleanDraw } = diagramContext.actions;

    const { model, blockViewState } = props;
    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);

    const viewState: StatementViewState = model === null ? blockViewState.draft[1] : model.viewState;
    const isDraftStatement: boolean = blockViewState
        && blockViewState.draft[1] instanceof DraftStatementViewState;
    let processType = "STATEMENT";
    let processName = "Variable";
    let sourceSnippet = "Source";
    const diagnostics = model?.typeData?.diagnostics;

    let isIntializedVariable = false;
    let isLogStmt = false;

    let isReferencedVariable = false;
    const diagnosticMsgs = getDiagnosticInfo(diagnostics);

    if (model) {
        processType = "Variable";
        sourceSnippet = model.source;
        if (STKindChecker.isCallStatement(model)) {
            const callStatement: CallStatement = model as CallStatement;
            const stmtFunctionCall: FunctionCall = callStatement.expression as FunctionCall;
            const nameRef: QualifiedNameReference = stmtFunctionCall.functionName as QualifiedNameReference;
            if (nameRef?.modulePrefix?.value === "log") {
                processType = "Log";
                processName = processType;
                isLogStmt = true;
            } else {
                processType = "Call";
                processName = processType;
            }
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
            processType = "AssignmentStatement";
            processName = "Assignment";
            if (STKindChecker.isSimpleNameReference(model?.varRef)) {
                processName = model?.varRef?.name?.value
            }
        } else if (STKindChecker.isActionStatement(model) && model.expression.kind === 'AsyncSendAction') {
            processType = "AsyncSend";
            processName = "Send"
        } else if (STKindChecker.isActionStatement(model) && STKindChecker.isWaitAction(model.expression)
            || (STKindChecker.isActionStatement(model)
                && STKindChecker.isCheckAction(model.expression)
                && STKindChecker.isWaitAction(model.expression.expression))) {
            processType = "Wait";
            processName = "Wait"
        } else if (STKindChecker.isCheckAction(model) && STKindChecker.isWaitAction(model.expression)) {
            processType = "Wait";
            processName = "Wait"
        } else {
            processType = "Custom";
            processName = "Custom";
        }
    } else if (isDraftStatement) {
        const draftViewState = blockViewState.draft[1] as DraftStatementViewState;
        processType = draftViewState.subType;
    }
    const errorSnippet = {
        diagnosticMsgs: diagnosticMsgs?.message,
        code: sourceSnippet,
        severity: diagnosticMsgs?.severity
    }
    const h: number = viewState.dataProcess.h;
    const w: number = viewState.dataProcess.w;
    const cx: number = blockViewState ? (viewState.bBox.cx - (PROCESS_SVG_WIDTH / 2)) : (viewState.bBox.cx - (w / 2));
    const cy: number = viewState.bBox.cy;
    const variableName = (model === null ? "New " + processType : processName);

    const onCancel = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setConfigWizardOpen(false);
    }

    React.useEffect(() => {
        if (model === null && blockViewState) {
            const draftVS = blockViewState.draft[1];
            const overlayFormConfig = getOverlayFormConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            if (renderAddForm) {
                renderAddForm(draftVS.targetPosition, overlayFormConfig as ConfigOverlayFormStatus, onCancel);
            }
        }
    }, []);

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
    };

    // let exsitingWizard: ReactNode = null;
    const onProcessClick = () => {
        if (processType !== "PROCESS") {
            const position: NodePosition = {
                startColumn: model.position.startColumn,
                startLine: model.position.startLine
            };
            const config = {
                type: processType
            }
            const overlayFormConfig = getOverlayFormConfig(processType, model.position, WizardType.EXISTING,
                blockViewState, undefined, stSymbolInfo, model);
            if (renderEditForm) {
                renderEditForm(model, model.position, overlayFormConfig as ConfigOverlayFormStatus, onCancel);
            }
        }
    };

    const onClickOpenInCodeView = () => {
        if (model && gotoSource) {
            const position: NodePosition = model.position as NodePosition;
            gotoSource({ startLine: position.startLine, startColumn: position.startColumn });
        }
    }

    const toolTip = isReferencedVariable ? "Variable is referred in the code below" : undefined;
    // If only processor is a initialized variable or log stmt or draft stmt Show the edit btn other.
    // Else show the delete button only.
    const localModel = (model as LocalVarDecl);
    const editAndDeleteButtons = (
        <>
            <g>
                <DeleteBtn
                    model={model}
                    cx={viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW) + PROCESS_SVG_WIDTH / 4}
                    cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 3)}
                    toolTipTitle={toolTip}
                    isReferencedInCode={isReferencedVariable}
                    onDraftDelete={onDraftDelete}
                    showOnRight={true}
                />
            </g>
            <EditBtn
                model={model}
                cx={viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET}
                cy={viewState.bBox.cy + (PROCESS_SVG_HEIGHT / 4)}
                onHandleEdit={onProcessClick}
            />
        </>
    );

    let assignmentText = null;
    let statmentTypeText = null;
    let methodCallText = null;
    if (!isDraftStatement && STKindChecker?.isCallStatement(model)) {
        if (STKindChecker.isFunctionCall(model.expression)) {
            assignmentText = model.expression.arguments[0]?.source;
            processType === "Log" ?
                methodCallText = getMethodCallFunctionName(model).replace("log:print", "").trim().toLocaleLowerCase()
                : methodCallText = getMethodCallFunctionName(model);
        } else if (STKindChecker.isCheckExpression(model.expression)) {
            if (STKindChecker.isFunctionCall(model.expression.expression)) {
                assignmentText = model.expression.expression.source;
            }
        }
    } else if (!isDraftStatement && STKindChecker?.isAssignmentStatement(model)) {
        assignmentText = (model as AssignmentStatement)?.expression?.source;
        statmentTypeText = model.varRef?.typeData?.typeSymbol?.signature
    } else if (!isDraftStatement && STKindChecker?.isLocalVarDecl(model)) {
        assignmentText = model?.initializer?.source;
        statmentTypeText = getStatementTypesFromST(localModel);
    }

    const processWrapper = isDraftStatement ? "main-process-wrapper active-data-processor" : "main-process-wrapper data-processor";
    const assignmentTextStyles = diagnosticMsgs?.severity === "ERROR" ? "assignment-text-error" : "assignment-text-default";

    const prosessTypes = (processType === "Log" || processType === "Call");

    let leftTextOffset: number = 0;
    let rightTextOffset: number = 0;

    if (viewState.isReceive) {
        if (viewState.arrowFrom === 'Left') {
            leftTextOffset = -(PROCESS_SVG_HEIGHT / 2);
        } else {
            rightTextOffset = -(PROCESS_SVG_HEIGHT / 2);
        }
    }

    let sendTextComponent: JSX.Element;

    if (viewState.isSend) {
        sendTextComponent = (
            <Assignment
                x={viewState.arrowFrom === 'Left' ? cx - DefaultConfig.dotGap * 3 : cx + PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW / 2 + (DefaultConfig.dotGap * 3)}
                y={cy}
                assignment={(model as ActionStatement).expression.expression.source.trim()}
                className={assignmentTextStyles}
                key_id={getRandomInt(1000)}
                textAnchor={viewState.arrowFrom === 'Left' ? 'end' : undefined}
            />
        )
    }

    const component: React.ReactNode = (!viewState.collapsed &&
        (
            <g>
                <g className={processWrapper} data-testid="data-processor-block" z-index="1000" target-line={model?.position.startLine}>
                    <React.Fragment>
                        {(processType !== "Log" && processType !== "Call" && processType !== "AsyncSend") && !isDraftStatement &&
                            <>
                                {statmentTypeText &&
                                    <>
                                        <StatementTypes
                                            statementType={statmentTypeText}
                                            x={cx - (VARIABLE_NAME_WIDTH + DefaultConfig.textAlignmentOffset)}
                                            y={cy + PROCESS_SVG_HEIGHT / 4 + leftTextOffset}
                                            key_id={getRandomInt(1000)}
                                        />
                                    </>
                                }
                                <VariableName
                                    processType={processType}
                                    variableName={processName}
                                    x={cx - (VARIABLE_NAME_WIDTH + DefaultConfig.textAlignmentOffset)}
                                    y={cy + PROCESS_SVG_HEIGHT / 4 + leftTextOffset}
                                    key_id={getRandomInt(1000)}
                                />
                            </>
                        }
                        <ProcessSVG
                            x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            varName={variableName}
                            processType={processType}
                            sourceSnippet={sourceSnippet}
                            position={model?.position}
                            diagnostics={errorSnippet}
                            openInCodeView={!isReadOnly && model && model.position && onClickOpenInCodeView}
                        />
                        <Assignment
                            x={cx + PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW / 2 + (DefaultConfig.dotGap * 3)}
                            y={prosessTypes ? (cy + PROCESS_SVG_HEIGHT / 2 + rightTextOffset) : (cy + PROCESS_SVG_HEIGHT / 3 + rightTextOffset)}
                            assignment={assignmentText}
                            className={assignmentTextStyles}
                            key_id={getRandomInt(1000)}
                        />
                        {sendTextComponent}
                        <MethodCall
                            x={cx + PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW / 2 + (DefaultConfig.dotGap * 3)}
                            y={(cy + PROCESS_SVG_HEIGHT / 4) - (DefaultConfig.dotGap / 2)}
                            methodCall={methodCallText}
                            key_id={getRandomInt(1000)}
                        />

                        {!isReadOnly &&
                            <g
                                className="process-options-wrapper"
                                height={PROCESS_SVG_HEIGHT_WITH_SHADOW}
                                width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW}
                                x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                                y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                            >
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
