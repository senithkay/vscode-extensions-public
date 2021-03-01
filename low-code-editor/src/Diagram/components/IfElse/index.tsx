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
import React, { useContext, useState } from "react";

import { BlockStatement, BracedExpression, IfElseStatement, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { WizardType } from "../../../ConfigurationSpec/types";
import { Context } from "../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from "../../utils";
import { getConditionConfig } from "../../utils/diagram-util";
import { findActualEndPositionOfIfElseStatement } from "../../utils/st-util";
import { BlockViewState, ElseViewState, IfViewState } from "../../view-state";
import { DraftStatementViewState } from "../../view-state/draft";
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

import { Else } from "./Else";
import {
    IfElseSVG,
    IFELSE_SHADOW_OFFSET,
    IFELSE_SVG_HEIGHT,
    IFELSE_SVG_HEIGHT_WITH_SHADOW,
    IFELSE_SVG_WIDTH,
    IFELSE_SVG_WIDTH_WITH_SHADOW
} from "./IfElseSVG";
import "./style.scss";

export interface IfElseProps {
    model: STNode;
    blockViewState?: BlockViewState;
    name?: string;
}

export function IfElse(props: IfElseProps) {
    const { state } = useContext(Context);
    const {
        isMutationProgress,
        syntaxTree,
        stSymbolInfo,
        appInfo,
        isReadOnly,
        setCodeLocationToHighlight: setCodeToHighlight,
        maximize: maximizeCodeView,
        diagramCleanDrawST,
        isCodeEditorActive,
        currentApp
    } = state;
    const { id: appId } = currentApp || {};
    const { isWaitingOnWorkspace } = appInfo;
    const { model, blockViewState, name } = props;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);
    const [ifElseConfigOverlayFormState, setIfElseConditionConfigState] = useState(undefined);

    React.useEffect(() => {
        if (model === null && blockViewState) {
            const draftVS = viewState as DraftStatementViewState;
            const conditionConfigState = getConditionConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            setIfElseConditionConfigState(conditionConfigState);
        }
    }, []);

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDrawST(syntaxTree);
        }
    };

    const onCancel = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDrawST(syntaxTree);
        }
        setConfigWizardOpen(false);
    }

    const onSave = () => {
        setConfigWizardOpen(false);
    }

    let codeSnippet = "IF ELSE CODE SNIPPET"
    let codeSnippetOnSvg = "IF"

    if (model) {
        codeSnippet = model.source.trim().split(')')[0]
        codeSnippetOnSvg = codeSnippet.substring(4, 13)
        codeSnippet = codeSnippet + ')'
    }

    const onClickOpenInCodeView = () => {
        maximizeCodeView("home", "vertical", appId);
        setCodeToHighlight(model?.position)
    }

    let viewState: any = model === null ?
        blockViewState.draft[1] as DraftStatementViewState
        : (model as IfElseStatement).viewState as IfViewState;
    let component: React.ReactElement;
    let drafts: React.ReactNode[] = [];
    let conditionType = "If";

    const deleteTriggerPosition = {
        cx: viewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET,
        cy: viewState.bBox.cy + ((IFELSE_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2))
    };
    const editTriggerPosition = {
        cx: viewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET,
        cy: viewState.bBox.cy + ((IFELSE_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2))
    };

    const isDraftStatement: boolean = viewState instanceof DraftStatementViewState;
    const ConditionWrapper = isDraftStatement ? cn("main-condition-wrapper active-condition") : cn("main-condition-wrapper if-condition-wrapper");

    if (model === null) {
        viewState = blockViewState.draft[1] as DraftStatementViewState;
        conditionType = viewState.subType;
        const x: number = viewState.bBox.cx;
        const y: number = viewState.bBox.cy;

        component = (
            <g className="if-else">
                <IfElseSVG
                    x={x - IFELSE_SVG_WIDTH_WITH_SHADOW / 2}
                    y={y - (IFELSE_SHADOW_OFFSET / 2)}
                    text="Draft"
                    data-testid="ifelse-block"
                    codeSnippet={codeSnippet}
                    codeSnippetOnSvg={codeSnippetOnSvg}
                    conditionType={conditionType}
                    openInCodeView={!isCodeEditorActive && !isWaitingOnWorkspace && model && model?.position && appId && onClickOpenInCodeView}
                />
                <>
                    {
                        (!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (
                            <g
                                className="condition-options-wrapper"
                                height={IFELSE_SVG_HEIGHT_WITH_SHADOW}
                                width={IFELSE_SVG_HEIGHT_WITH_SHADOW}
                                x={viewState.bBox.cx - (IFELSE_SHADOW_OFFSET / 2)}
                                y={viewState.bBox.cy - (IFELSE_SHADOW_OFFSET / 2)}
                            >
                                {model === null && blockViewState && isDraftStatement && ifElseConfigOverlayFormState &&
                                // {model === null && blockViewState?.draft && isDraftStatement &&
                                    <ConditionConfigForm
                                        type={blockViewState.draft[1].subType}
                                        position={{
                                            x: viewState.bBox.cx + IFELSE_SVG_HEIGHT_WITH_SHADOW,
                                            y: viewState.bBox.cy
                                        }}
                                        wizardType={WizardType.NEW}
                                        onCancel={onCancel}
                                        onSave={onSave}
                                        configOverlayFormStatus={ifElseConfigOverlayFormState}
                                    />
                                }
                                {model && isConfigWizardOpen && ifElseConfigOverlayFormState &&
                                    <ConditionConfigForm
                                        type={"If"}
                                        position={{
                                            x: viewState.bBox.cx + IFELSE_SVG_HEIGHT_WITH_SHADOW,
                                            y: viewState.bBox.cy
                                        }}
                                        wizardType={WizardType.EXISTING}
                                        onCancel={onCancel}
                                        onSave={onSave}
                                        configOverlayFormStatus={ifElseConfigOverlayFormState}
                                    />
                                }
                                {!isConfigWizardOpen &&
                                    <>
                                        <rect
                                            x={viewState.bBox.cx - (IFELSE_SVG_WIDTH / 3)}
                                            y={viewState.bBox.cy + (IFELSE_SVG_HEIGHT / 3)}
                                            className="condition-rect"
                                        />
                                        <DeleteBtn
                                            {...deleteTriggerPosition}
                                            model={model}
                                            onDraftDelete={onDraftDelete}
                                        />
                                        <EditBtn
                                            model={model}
                                            {...editTriggerPosition}
                                        />
                                    </>
                                }

                            </g>
                        )
                    }
                </>
            </g>
        );
    } else {
        const ifStatement: IfElseStatement = model as IfElseStatement;
        viewState = ifStatement.viewState as IfViewState;
        const bodyViewState: BlockViewState = ifStatement.ifBody.viewState;

        if (bodyViewState.draft) {
            drafts = getDraftComponent(bodyViewState, state);
        }

        if (!viewState.isElseIf) {
            const position: any = findActualEndPositionOfIfElseStatement(ifStatement);
            if (position) {
                ifStatement.position.endLine = position.endLine;
                ifStatement.position.endColumn = position.endColumn;
            }
        }

        const x: number = viewState.headIf.cx;
        const y: number = viewState.headIf.cy;

        const componentName: string = name ? "ELSE IF" : "IF";

        const conditionExpr: BracedExpression = ifStatement.condition as BracedExpression;
        const isElseExist: boolean = ((ifStatement.elseBody?.elseBody as BlockStatement)?.kind === "BlockStatement");
        const isDefaultElseExist: boolean = viewState.defaultElseVS !== undefined;

        const isElseIfExist: boolean = (ifStatement.elseBody?.elseBody as IfElseStatement)?.kind === "IfElseStatement";

        const children = getSTComponents(ifStatement.ifBody.statements);
        const pluses: React.ReactNode[] = [];
        for (const plusView of ifStatement.ifBody.viewState.plusButtons) {
            pluses.push(<PlusButton viewState={plusView} model={ifStatement.ifBody} initPlus={false} />)
        }

        if (bodyViewState.collapseView) {
            children.push(<Collapse blockViewState={bodyViewState} />)
        }

        const onIfHeadClick = () => {
            const conditionExpression = conditionExpr.expression.source;
            const position = {
                column: model.position.startColumn,
                line: model.position.startLine
            };
            setConfigWizardOpen(true);
            const conditionConfigState = getConditionConfig("If", position, WizardType.EXISTING, undefined, {
                type: "If",
                conditionExpression,
                conditionPosition: conditionExpr.position
            });
            setIfElseConditionConfigState(conditionConfigState);
        };


        component = (
            conditionExpr && conditionExpr.expression && viewState && !viewState.collapsed &&
            (
                <g className="if-else">
                    {/* Render top horizontal line in else if scenario */}
                    <line
                        x1={viewState.elseIfTopHorizontalLine.x}
                        y1={viewState.elseIfTopHorizontalLine.y}
                        x2={viewState.elseIfLifeLine.x - (IFELSE_SVG_WIDTH / 2)}
                        y2={viewState.elseIfTopHorizontalLine.y}
                    />
                    {/* Render top vertical life line in else if scenario */}
                    <line
                        x1={viewState.elseIfLifeLine.x}
                        y1={viewState.elseIfLifeLine.y}
                        x2={viewState.elseIfLifeLine.x}
                        y2={viewState.elseIfLifeLine.y + viewState.elseIfLifeLine.h}
                    />
                    {/* Render bottom horizontal line in else if scenario */}
                    <line
                        x1={viewState.elseIfBottomHorizontalLine.x}
                        y1={viewState.elseIfBottomHorizontalLine.y}
                        x2={viewState.elseIfLifeLine.x}
                        y2={viewState.elseIfBottomHorizontalLine.y}
                    />
                    <g className="if-head-wrapper" >
                        <IfElseSVG
                            x={x - IFELSE_SVG_WIDTH_WITH_SHADOW / 2}
                            y={y - IFELSE_SVG_HEIGHT_WITH_SHADOW / 2}
                            text={componentName}
                            data-testid="ifelse-block"
                            codeSnippet={codeSnippet}
                            codeSnippetOnSvg={codeSnippetOnSvg}
                            conditionType={conditionType}
                            openInCodeView={!isCodeEditorActive && !isWaitingOnWorkspace && model && model?.position && appId && onClickOpenInCodeView}
                        />
                        <>
                            {
                                (!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
                                    className="condition-options-wrapper"
                                    height={IFELSE_SVG_HEIGHT_WITH_SHADOW}
                                    width={IFELSE_SVG_HEIGHT_WITH_SHADOW}
                                    x={viewState.bBox.cx - (IFELSE_SHADOW_OFFSET / 2)}
                                    y={viewState.bBox.cy - (IFELSE_SHADOW_OFFSET / 2)}
                                >
                                    <rect
                                        x={viewState.bBox.cx - (IFELSE_SVG_WIDTH / 4)}
                                        y={viewState.bBox.cy + (IFELSE_SVG_HEIGHT / 3)}
                                        className="condition-rect"
                                    />
                                    {model === null && blockViewState && isDraftStatement && ifElseConfigOverlayFormState &&
                                        <ConditionConfigForm
                                            type={blockViewState.draft[1].subType}
                                            position={{
                                                x: viewState.bBox.cx + IFELSE_SVG_HEIGHT_WITH_SHADOW,
                                                y: viewState.bBox.cy
                                            }}
                                            wizardType={WizardType.NEW}
                                            onCancel={onCancel}
                                            onSave={onSave}
                                            configOverlayFormStatus={ifElseConfigOverlayFormState}
                                        />
                                    }
                                    {model && isConfigWizardOpen && ifElseConfigOverlayFormState &&
                                        <ConditionConfigForm
                                            type={"If"}
                                            position={{
                                                x: viewState.bBox.cx + IFELSE_SVG_HEIGHT_WITH_SHADOW,
                                                y: viewState.bBox.cy
                                            }}
                                            wizardType={WizardType.EXISTING}
                                            onCancel={onCancel}
                                            onSave={onSave}
                                            configOverlayFormStatus={ifElseConfigOverlayFormState}
                                        />
                                    }
                                    <DeleteBtn
                                        {...deleteTriggerPosition}
                                        model={model}
                                        onDraftDelete={onDraftDelete}
                                    />
                                    <EditBtn
                                        model={model}
                                        {...editTriggerPosition}
                                        onHandleEdit={onIfHeadClick}
                                    />
                                </g>)
                            }
                        </>
                    </g>
                    {...children}
                    {isElseExist && <Else model={ifStatement.elseBody.elseBody} />}
                    {isDefaultElseExist && <Else defaultViewState={viewState.defaultElseVS as ElseViewState} />}
                    {isElseIfExist && <IfElse model={ifStatement.elseBody.elseBody} name={componentName} />}
                    {...pluses}
                    {...drafts}
                </g>
            )
        );
    }

    return (
        <g className={ConditionWrapper}>
            {component}
        </g>
    );
}
