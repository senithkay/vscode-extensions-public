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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline
import React, { useContext, useState } from "react";

import { WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../../Contexts/Diagram";
import { getConditionConfig } from "../../../../../utils/diagram-util";
import { DefaultConfig } from "../../../../../visitors/default";
import { FormGenerator } from "../../../../FormComponents/FormGenerator";
import { DeleteBtn } from "../../../Components/DiagramActions/DeleteBtn";
import { DELETE_SVG_OFFSET, DELETE_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../../Components/DiagramActions/EditBtn";
import { EDIT_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/EditBtn/EditSVG";
import { BlockViewState, EndViewState } from "../../../ViewState";
import { DraftStatementViewState } from "../../../ViewState/draft";

import { StopSVG, STOP_SVG_HEIGHT, STOP_SVG_HEIGHT_WITH_SHADOW, STOP_SVG_SHADOW_OFFSET, STOP_SVG_WIDTH_WITH_SHADOW } from "./StopSVG";
import "./style.scss";

export interface EndProps {
    viewState?: EndViewState;
    model?: STNode;
    blockViewState?: BlockViewState;
    isExpressionFunction?: boolean;
}

export function End(props: EndProps) {
    const {
        api: {
            code: {
                gotoSource
            },
            configPanel: {
                dispactchConfigOverlayForm: openNewReturnConfigForm,
            }
        },
        actions: {
            diagramCleanDraw,
            toggleDiagramOverlay
        },
        props: {
            isCodeEditorActive,
            syntaxTree,
            isMutationProgress,
            isWaitingOnWorkspace,
            stSymbolInfo,
            isReadOnly,
        }
    } = useContext(Context);

    const { viewState, model, blockViewState, isExpressionFunction } = props;
    const isDraftStatement: boolean = blockViewState
        && blockViewState.draft[1] instanceof DraftStatementViewState;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);
    const [endConfigFormOverlayState, setEndConfigFormOverlayState] = useState(undefined);

    const compType = "end";
    let cx: number;
    let cy: number;
    if (viewState) {
        cx = viewState.bBox.cx;
        cy = viewState.bBox.cy;
    } else if (model) {
        cx = model.viewState.bBox.cx;
        cy = model.viewState.bBox.cy;
    }

    const deleteTriggerPosition = {
        cx: cx - ((DELETE_SVG_WIDTH_WITH_SHADOW / 2) + (DELETE_SVG_OFFSET / 2) - (DefaultConfig.dotGap / 1.6)),
        cy: cy + ((STOP_SVG_HEIGHT / 3) - (DefaultConfig.dotGap / 1.6))
    };

    const editTriggerPosition = {
        cx: cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + DefaultConfig.dotGap * 2.2,
        cy: cy + ((STOP_SVG_HEIGHT / 3) - (DefaultConfig.dotGap / 1.6))
    };

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
    };
    const onCancel = () => {
        setConfigWizardOpen(false);
        toggleDiagramOverlay();
    }

    const onReturnEditClick = () => {
        setConfigWizardOpen(true);
        const configOverrlayState = getConditionConfig('Return', model.position, WizardType.EXISTING, model.viewState, undefined, stSymbolInfo, model);
        setEndConfigFormOverlayState(configOverrlayState);
        openNewReturnConfigForm('Return', model.position, WizardType.EXISTING, model.viewState, undefined, stSymbolInfo, model);
    }

    const onSave = () => {
        setConfigWizardOpen(false);
        toggleDiagramOverlay();
    }

    let codeSnippet = "No return statement"

    if (model) {
        codeSnippet = model.source
    }

    const onClickOpenInCodeView = () => {
        if (model) {
            const position: NodePosition = model.position as NodePosition;
            gotoSource({ startLine: position.startLine, startColumn: position.startColumn });
        }
    }

    const draftVS = blockViewState?.draft[1] as DraftStatementViewState

    const component: React.ReactElement = ((!model?.viewState.collapsed || blockViewState) &&
        (
            <g className="end-wrapper" data-testid="end-block">
                <StopSVG
                    x={cx - ((STOP_SVG_WIDTH_WITH_SHADOW / 2) + (STOP_SVG_SHADOW_OFFSET / 4))}
                    y={cy - DefaultConfig.shadow}
                    text={compType.toUpperCase()}
                    codeSnippet={codeSnippet}
                    openInCodeView={!isCodeEditorActive && !isWaitingOnWorkspace && model && model?.position && onClickOpenInCodeView}
                />
                {blockViewState || model ?
                    (<>
                        {
                            (!isExpressionFunction && !isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
                                className="end-options-wrapper"
                                height={STOP_SVG_HEIGHT_WITH_SHADOW}
                                width={STOP_SVG_HEIGHT_WITH_SHADOW}
                                x={cx - (STOP_SVG_SHADOW_OFFSET / 2)}
                                y={cy - (STOP_SVG_SHADOW_OFFSET / 2)}
                            >

                                {isConfigWizardOpen && endConfigFormOverlayState &&
                                    <FormGenerator
                                        onCancel={onCancel}
                                        onSave={onSave}
                                        configOverlayFormStatus={endConfigFormOverlayState}
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
                                    onHandleEdit={onReturnEditClick}
                                />
                            </g>)
                        }
                    </>
                    ) : null
                }
            </g >
        )
    );

    return (
        <g>
            {component}
        </g>
    );
}
