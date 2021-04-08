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

import { CaptureBindingPattern, ForeachStatement, STNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../../ConfigurationSpec/types";
import { Context } from "../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from "../../utils";
import { getConditionConfig } from "../../utils/diagram-util";
import { BlockViewState, ForEachViewState } from "../../view-state";
import { DraftInsertPosition, DraftUpdateStatement } from "../../view-state/draft";
import { DefaultConfig } from "../../visitors/default";
import { Collapse } from "../Collapse";
import { ConditionConfigForm } from "../ConfigForms/ConditionConfigForms";
import { DeleteBtn } from "../DiagramActions/DeleteBtn";
import {
    DELETE_SVG_HEIGHT_WITH_SHADOW,
    DELETE_SVG_OFFSET,
    DELETE_SVG_WIDTH_WITH_SHADOW
} from "../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../DiagramActions/EditBtn";
import {
    EDIT_SVG_HEIGHT_WITH_SHADOW,
    EDIT_SVG_OFFSET,
    EDIT_SVG_WIDTH_WITH_SHADOW
} from "../DiagramActions/EditBtn/EditSVG";
import { PlusButton } from "../Plus";
import { ForeachConfig } from "../Portals/ConfigForm/types";

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
    const { state, diagramCleanDraw, diagramRedraw, insertComponentStart } = useContext(Context); // TODO: Get diagramCleanDraw, diagramRedraw from state
    const { syntaxTree, isReadOnly, isMutationProgress, stSymbolInfo, isWaitingOnWorkspace } = state;

    const { model } = props;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);
    const [forEachConfigOverlayState, setForEachConfigOverlayState] = useState(undefined);

    const pluses: React.ReactNode[] = [];
    const modelForeach: ForeachStatement = model as ForeachStatement;
    const children = getSTComponents(modelForeach.blockStatement.statements);

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

        const varRef: CaptureBindingPattern = modelForeach.typedBindingPattern.bindingPattern as CaptureBindingPattern;
        const variable: string = varRef.variableName.value;

        const conditionExpression: ForeachConfig = {
            variable,
            collection: modelForeach.actionOrExpressionNode.source.trim(),
            model: modelForeach
        }

        const position: DraftInsertPosition = {
            column: model.position.startColumn,
            line: model.position.startLine
        };

        const conditionUpdatePosition: DraftUpdateStatement = {
            /*
            * As we are replacing the whole condition including the variable and the iteration condition different
            * components of the model are used to generate the update position
            * foreach var [i in expr] <- this whole part gets replaced on update
            */
            startLine: modelForeach.typedBindingPattern.bindingPattern.position.startLine,
            startColumn: modelForeach.typedBindingPattern.bindingPattern.position.startColumn,
            endLine: modelForeach.actionOrExpressionNode.position.endLine,
            endColumn: modelForeach.actionOrExpressionNode.position.endColumn,
        }
        setConfigWizardOpen(true);
        const conditionConfigFormState = getConditionConfig("ForEach", position, WizardType.EXISTING, undefined, {
            type: "ForEach",
            conditionExpression,
            conditionPosition: conditionUpdatePosition
        }, stSymbolInfo, model)

        setForEachConfigOverlayState(conditionConfigFormState);
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
        cx: viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET,
        cy: viewState.bBox.cy + ((FOREACH_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2))
    };
    const editTriggerPosition = {
        cx: viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET,
        cy: viewState.bBox.cy + ((FOREACH_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2))
    };

    const unFoldedComponent = (
        <g className="foreach-block" data-testid="foreach-block">
            <rect className="for-each-rect" {...rectProps} />
            <g className="foreach-polygon-wrapper">
                <ForeachSVG x={x - FOREACH_SVG_WIDTH_WITH_SHADOW / 2} y={y} text="FOR EACH" />
                <>
                    {(!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
                        className="foreach-options-wrapper"
                        height={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                        width={FOREACH_SVG_HEIGHT_WITH_SHADOW}
                        x={viewState.bBox.cx - (FOREACH_SHADOW_OFFSET / 2)}
                        y={viewState.bBox.cy - (FOREACH_SHADOW_OFFSET / 2)}
                    >
                        {model && isConfigWizardOpen &&
                            <ConditionConfigForm
                                type={"ForEach"}
                                position={{
                                    x: viewState.bBox.cx + FOREACH_SVG_WIDTH,
                                    y: viewState.bBox.cy
                                }}
                                wizardType={WizardType.EXISTING}
                                onCancel={onCancel}
                                onSave={onSave}
                                configOverlayFormStatus={forEachConfigOverlayState}
                            />
                        }
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
            {...pluses}
            {...children}
            {...drafts}
        </g>
    );

    const foldedComponent = (
        <g className="foreach-block" data-testid="foreach-block">
            <rect className="for-each-rect" {...rectProps} />
            <g className="foreach-polygon-wrapper" onClick={onForeachHeadClick}>
                <ForeachSVG x={x - FOREACH_SVG_WIDTH_WITH_SHADOW / 2} y={y} text="FOR EACH" />
                <>
                    {
                        (!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
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
                            {model && isConfigWizardOpen &&
                                <ConditionConfigForm
                                    type={"ForEach"}
                                    position={{
                                        x: viewState.bBox.cx + FOREACH_SVG_WIDTH,
                                        y: viewState.bBox.cy
                                    }}
                                    wizardType={WizardType.EXISTING}
                                    onCancel={onCancel}
                                    onSave={onSave}
                                    configOverlayFormStatus={forEachConfigOverlayState}
                                />
                            }

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
        <g className="foreach-wrapper">
            <g>
                {foreachComponent}
            </g>
        </g>
    );
}

