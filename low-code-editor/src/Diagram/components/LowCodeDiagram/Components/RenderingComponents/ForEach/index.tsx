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
// tslint:disable: jsx-no-multiline-js  jsx-wrap-multiline
import React, { ReactNode, useContext, useState } from "react"

import { ConfigOverlayFormStatus, ForeachConfig, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ForeachStatement, NodePosition, STKindChecker, STNode, TypedBindingPattern } from "@wso2-enterprise/syntax-tree";

import { DeleteBtn } from "../../../Components/DiagramActions/DeleteBtn";
import {
    DELETE_SVG_HEIGHT_WITH_SHADOW,
    DELETE_SVG_WIDTH_WITH_SHADOW
} from "../../../Components/DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../../Components/DiagramActions/EditBtn";
import {
    EDIT_SVG_HEIGHT_WITH_SHADOW,
    EDIT_SVG_OFFSET,
    EDIT_SVG_WIDTH_WITH_SHADOW
} from "../../../Components/DiagramActions/EditBtn/EditSVG";
import { Context } from "../../../Context/diagram";
import { getConditionConfig, getDiagnosticInfo, getDraftComponent, getRandomInt, getSTComponents } from "../../../Utils";
import { BlockViewState, ForEachViewState } from "../../../ViewState";
import { DefaultConfig } from "../../../Visitors/default";
import { PlusButton } from "../../PlusButtons/Plus";
import { Collapse } from "../Collapse";
import { ConditionAssignment, CONDITION_ASSIGNMENT_NAME_WIDTH } from "../ConditionAssignment";
import { ControlFlowIterationCount, ControlFlowIterationCountProp, CONTROL_FLOW_ITERATION_COUNT_PADDING } from "../ControlFlowIterationCount"
import { ControlFlowLine } from "../ControlFlowLine";

import { ColapseButtonSVG, COLLAPSE_SVG_WIDTH } from "./ColapseButtonSVG";
import { ExpandButtonSVG } from "./ExpandButtonSVG";
import {
    ForeachSVG,
    FOREACH_SHADOW_OFFSET,
    FOREACH_SVG_HEIGHT,
    FOREACH_SVG_HEIGHT_WITH_SHADOW,
    FOREACH_SVG_WIDTH, FOREACH_SVG_WIDTH_WITH_SHADOW
} from "./ForeachSVG";
import "./style.scss";
import { COLLAPSE_DOTS_SVG_WIDTH, ThreeDotsSVG } from "./ThreeDotsSVG";

export interface ForeachProps {
    blockViewState?: BlockViewState;
    model: STNode;
}

export function ForEach(props: ForeachProps) {
    const diagramContext = useContext(Context);
    const { syntaxTree, isReadOnly, stSymbolInfo } = diagramContext.props;
    const renderEditForm = diagramContext?.api?.edit?.renderEditForm;
    const gotoSource = diagramContext?.api?.code?.gotoSource;
    const state = diagramContext?.state;
    const { diagramCleanDraw, diagramRedraw, insertComponentStart } = diagramContext.actions;
    const { model } = props;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);
    // const [forEachConfigOverlayState, setForEachConfigOverlayState] = useState(undefined);

    const pluses: React.ReactNode[] = [];
    const modelForeach: ForeachStatement = model as ForeachStatement;
    const children = getSTComponents(modelForeach.blockStatement.statements);
    const controlFlowLines: React.ReactNode[] = [];

    const viewState: ForEachViewState = modelForeach.viewState;
    const bodyViewState: BlockViewState = modelForeach.blockStatement.viewState;

    const x: number = viewState.foreachHead.cx;
    const y: number = viewState.foreachHead.cy - (viewState.foreachHead.h / 2) - (FOREACH_SHADOW_OFFSET / 2);
    const r: number = DefaultConfig.forEach.radius;
    const paddingUnfold = DefaultConfig.forEach.paddingUnfold;

    let drafts: React.ReactNode[] = [];
    if (bodyViewState.draft) {
        drafts = getDraftComponent(bodyViewState, state, insertComponentStart);
    }

    const lifeLineProps = {
        x1: viewState.foreachLifeLine.cx,
        y1: viewState.foreachLifeLine.cy,
        x2: viewState.foreachLifeLine.cx,
        y2: (viewState.foreachLifeLine.cy + viewState.foreachLifeLine.h)
    };
    const rectProps = {
        x: viewState.foreachBodyRect.cx - (viewState.foreachBodyRect.w / 2),
        y: viewState.foreachBodyRect.cy,
        width: viewState.foreachBodyRect.w,
        height: viewState.foreachBodyRect.h,
        rx: r
    };
    const foldProps = {
        x: x + (viewState.foreachBodyRect.w / 2) - paddingUnfold - COLLAPSE_SVG_WIDTH,
        y: y + (FOREACH_SVG_HEIGHT_WITH_SHADOW / 2) + paddingUnfold
    };

    let controlFlowIterationCountProp: ControlFlowIterationCountProp;
    if (model.controlFlow?.isReached) {
        controlFlowIterationCountProp = {
            x: viewState.foreachBodyRect.cx - (viewState.foreachBodyRect.w / 2) + CONTROL_FLOW_ITERATION_COUNT_PADDING,
            y: viewState.foreachBodyRect.cy + CONTROL_FLOW_ITERATION_COUNT_PADDING,
            count: model.controlFlow.numberOfIterations
        }
    }

    if (bodyViewState.collapseView) {
        children.push(<Collapse blockViewState={bodyViewState} />)
    }

    for (const plusView of modelForeach.blockStatement.viewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} model={modelForeach.blockStatement} initPlus={false} />)
    }

    const handleFoldClick = () => {
        viewState.folded = true;
        diagramRedraw(syntaxTree);
    };

    const handleExpandClick = () => {
        viewState.folded = false;
        diagramRedraw(syntaxTree);
    };

    const onForeachHeadClick = () => {
        // TODO: re enable this after the release
        const variable: string = modelForeach?.typedBindingPattern?.bindingPattern?.source?.trim();
        const type: string = modelForeach?.typedBindingPattern?.typeDescriptor?.source?.trim();

        const conditionExpression: ForeachConfig = {
            variable,
            type,
            collection: modelForeach.actionOrExpressionNode.source.trim(),
            model: modelForeach
        }

        const conditionUpdatePosition: NodePosition = {
            /*
            * As we are replacing the whole condition including the variable and the iteration condition different
            * components of the model are used to generate the update position
            * foreach var [i in expr] <- this whole part gets replaced on update
            */
            startLine: modelForeach.typedBindingPattern.bindingPattern.position.startLine,
            startColumn: modelForeach.typedBindingPattern.position.startColumn,
            endLine: modelForeach.actionOrExpressionNode.position.endLine,
            endColumn: modelForeach.actionOrExpressionNode.position.endColumn,
        }
        // setConfigWizardOpen(true);
        const conditionConfigFormState = getConditionConfig("ForEach", model.position, WizardType.EXISTING, undefined, {
            type: "ForEach",
            conditionExpression,
            conditionPosition: conditionUpdatePosition,
            model
        }, stSymbolInfo, model);
        renderEditForm(model, model.position, conditionConfigFormState as ConfigOverlayFormStatus, onCancel);
        // setForEachConfigOverlayState(conditionConfigFormState);
    };

    const onDraftDelete = () => {
        diagramCleanDraw(syntaxTree);
    };

    const onCancel = () => {
        diagramCleanDraw(syntaxTree);
        setConfigWizardOpen(false);
    }
    const onSave = () => {
        setConfigWizardOpen(false);
    }

    const deleteTriggerPosition = {
        cx: viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW) + FOREACH_SVG_WIDTH / 4,
        cy: viewState.bBox.cy + ((FOREACH_SVG_HEIGHT / 2)) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 3)
    };
    const editTriggerPosition = {
        cx: viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET,
        cy: viewState.bBox.cy + ((FOREACH_SVG_HEIGHT / 2)) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 3)
    };
    let codeSnippet = "FOR EACH CODE SNIPPET";

    if (model) {
        codeSnippet = model.source.trim().split(')')[0]
        codeSnippet = codeSnippet + ')'
    }

    const onClickOpenInCodeView = () => {
        if (model) {
            const position: NodePosition = model.position as NodePosition;
            gotoSource({ startLine: position.startLine, startColumn: position.startColumn });
        }
    }

    for (const controlFlowLine of bodyViewState.controlFlow.lineStates) {
        controlFlowLines.push(<ControlFlowLine controlFlowViewState={controlFlowLine} />);
    }

    let assignmentText: any = (!drafts && STKindChecker?.isForeachStatement(model));
    const forEachModel = model as ForeachStatement
    const variableName = ((forEachModel.typedBindingPattern) as TypedBindingPattern)?.bindingPattern?.source?.trim();
    const keyWord = forEachModel.inKeyword.value
    const forEachSource = forEachModel?.actionOrExpressionNode?.source;
    assignmentText = variableName + " " + keyWord + " " + forEachSource;
    const diagnostics = (forEachModel?.actionOrExpressionNode?.typeData.diagnostics).length !== 0 ? (forEachModel?.actionOrExpressionNode?.typeData?.diagnostics) : (forEachModel?.typedBindingPattern?.typeData?.diagnostics);

    const diagnosticMsgs = getDiagnosticInfo(diagnostics);
    const diagnosticStyles = diagnosticMsgs?.severity === "ERROR" ? "foreach-block-error" : "foreach-block-warning";
    const forEachRectStyles = diagnosticMsgs ? diagnosticStyles : "foreach-block"

    const errorSnippet = {
        diagnosticMsgs: diagnosticMsgs?.message,
        code: codeSnippet,
        severity: diagnosticMsgs?.severity
    }

    const unFoldedComponent = (
        <g className={forEachRectStyles} data-testid="foreach-block">
            <rect className="for-each-rect" {...rectProps} />
            <g className="foreach-polygon-wrapper">
                <ForeachSVG
                    x={x - FOREACH_SVG_WIDTH_WITH_SHADOW / 2}
                    y={y}
                    text="FOR EACH"
                    codeSnippet={codeSnippet}
                    diagnostics={errorSnippet}
                    openInCodeView={model && model?.position && onClickOpenInCodeView}

                />

                <ConditionAssignment
                    x={x - (CONDITION_ASSIGNMENT_NAME_WIDTH + DefaultConfig.textAlignmentOffset)}
                    y={y + FOREACH_SVG_HEIGHT / 5}
                    assignment={assignmentText}
                    className="condition-assignment"
                    key_id={getRandomInt(1000)}
                />
                <>
                    {model.controlFlow?.isReached &&
                        <ControlFlowIterationCount {...controlFlowIterationCountProp} />
                    }
                </>
                <>
                    {!isReadOnly && (<g
                        className="foreach-options-wrapper"
                        height={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                        width={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                        x={viewState.bBox.cx - (FOREACH_SHADOW_OFFSET / 2)}
                        y={viewState.bBox.cy - (FOREACH_SHADOW_OFFSET / 2)}
                    >
                        {/* {model && isConfigWizardOpen &&
                            <FormGenerator
                                onCancel={onCancel}
                                onSave={onSave}
                                configOverlayFormStatus={forEachConfigOverlayState}
                            />
                        } */}
                        {!isConfigWizardOpen &&
                            <>
                                <rect
                                    x={viewState.bBox.cx - (FOREACH_SVG_WIDTH / 4)}
                                    y={viewState.bBox.cy + (FOREACH_SVG_HEIGHT / 3)}
                                    className="forech-rect"
                                />
                                <DeleteBtn
                                    {...deleteTriggerPosition}
                                    model={model}
                                    onDraftDelete={onDraftDelete}
                                />
                                <EditBtn
                                    onHandleEdit={onForeachHeadClick}
                                    model={model}
                                    {...editTriggerPosition}
                                />
                            </>
                        }
                    </g>)}
                </>
            </g>
            <line className="life-line" {...lifeLineProps} />
            {(children.length !== 0) && <ColapseButtonSVG {...foldProps} onClick={handleFoldClick} />}
            {controlFlowLines}
            {!isReadOnly && pluses}
            {children}
            {drafts}
        </g>
    );

    const foldedComponent = (
        <g className={forEachRectStyles} data-testid="foreach-block">
            <rect className="for-each-rect" {...rectProps} />
            <g className="foreach-polygon-wrapper" onClick={onForeachHeadClick}>
                <ForeachSVG x={x - FOREACH_SVG_WIDTH_WITH_SHADOW / 2} y={y} text="FOR EACH" />
                {/* <Assignment x={x - (FOREACH_SVG_WIDTH_WITH_SHADOW / 2 + ASSIGNMENT_NAME_WIDTH)} y={y + FOREACH_SVG_HEIGHT / 4} assignment={assignmentText} className="condition-assignment"/> */}
                <ConditionAssignment
                    x={x - (CONDITION_ASSIGNMENT_NAME_WIDTH + DefaultConfig.textAlignmentOffset)}
                    y={y + FOREACH_SVG_HEIGHT / 5}
                    assignment={assignmentText}
                    className="condition-assignment"
                    key_id={getRandomInt(1000)}
                />                <>
                    {
                        !isReadOnly && (<g
                            className="foreach-options-wrapper"
                            height={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                            width={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                            x={viewState.bBox.cx - (FOREACH_SHADOW_OFFSET / 2)}
                            y={viewState.bBox.cy - (FOREACH_SHADOW_OFFSET / 2)}
                        >
                            <rect
                                x={viewState.bBox.cx - (FOREACH_SVG_WIDTH / 4)}
                                y={viewState.bBox.cy + (FOREACH_SVG_HEIGHT / 3)}
                                className="forech-rect"
                            />
                            {/* {model && isConfigWizardOpen &&
                                <FormGenerator
                                    onCancel={onCancel}
                                    onSave={onSave}
                                    configOverlayFormStatus={forEachConfigOverlayState}
                                />
                            } */}

                            {!isConfigWizardOpen &&
                                <>
                                    <rect
                                        x={viewState.bBox.cx - (FOREACH_SVG_WIDTH / 4)}
                                        y={viewState.bBox.cy + (FOREACH_SVG_HEIGHT / 3)}
                                        className="forech-rect"
                                    />
                                    <DeleteBtn
                                        {...deleteTriggerPosition}
                                        model={model}
                                        onDraftDelete={onDraftDelete}
                                    />
                                    <g className="disable">
                                        <EditBtn
                                            model={model}
                                            {...editTriggerPosition}
                                        />
                                    </g>
                                </>
                            }
                        </g>)
                    }
                </>
            </g>
            <ExpandButtonSVG {...foldProps} onClick={handleExpandClick} />
            <ThreeDotsSVG x={x - (COLLAPSE_DOTS_SVG_WIDTH / 2)} y={y + FOREACH_SVG_HEIGHT_WITH_SHADOW} />
        </g>
    );

    const foreachComponent: ReactNode = (
        // Render unfolded component
        (!viewState.collapsed && !viewState.folded && unFoldedComponent) ||
        // Render folded component
        (!viewState.collapsed && viewState.folded && foldedComponent)
    );

    return (
        <g className="main-foreach-wrapper">
            <g>
                {foreachComponent}
            </g>
        </g>
    );
}

