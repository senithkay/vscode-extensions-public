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

import { ConfigOverlayFormStatus, WizardType } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ActionStatement, ReturnStatement, STNode } from "@wso2-enterprise/syntax-tree";

import { getOverlayFormConfig, getRandomInt } from "../../../../../utils/diagram-util";
import { DefaultConfig } from "../../../../../visitors/default";
import { DeleteBtn } from "../../../Components/DiagramActions/DeleteBtn";
import { DELETE_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../../Components/DiagramActions/EditBtn";
import { EDIT_SVG_WIDTH_WITH_SHADOW } from "../../../Components/DiagramActions/EditBtn/EditSVG";
import { Context } from "../../../Context/diagram";
import { BlockViewState } from "../../../ViewState";
import { DraftStatementViewState } from "../../../ViewState/draft";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_HEIGHT_WITH_SHADOW, PROCESS_SVG_SHADOW_OFFSET, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW } from "../Processor/ProcessSVG";
import { VariableName, VARIABLE_NAME_WIDTH } from "../VariableName";

import { ReturnSVG, RETURN_SVG_HEIGHT, RETURN_SVG_WIDTH, } from "./ReturnSVG";
import "./style.scss";

export interface ReturnProps {
    model?: STNode;
    blockViewState?: BlockViewState;
}

export function Return(props: ReturnProps) {
    const {
        actions: {
            diagramCleanDraw
        },
        props: {
            syntaxTree,
            stSymbolInfo,
            isWaitingOnWorkspace,
            isMutationProgress,
            isReadOnly,
        },
        api: {
            edit: {
                renderAddForm,
                renderEditForm
            }

        }
    } = useContext(Context);

    const { model, blockViewState } = props;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);

    let cx: number;
    let cy: number;
    let sourceSnippet = "Source";

    let compType: string = "";
    if (model) {
        cx = model.viewState.bBox.cx;
        cy = model.viewState.bBox.cy;
        sourceSnippet = model.source;
        if (model.viewState.isCallerAction) {
            compType = "return";
        }
    } else if (blockViewState) {
        cx = blockViewState.draft[1].bBox.cx;
        cy = blockViewState.draft[1].bBox.cy;
        compType = blockViewState.draft[1].subType.toUpperCase();
    }

    const deleteTriggerPosition = {
        cx: cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - (DefaultConfig.dotGap / 2),
        cy: cy + (RETURN_SVG_HEIGHT / 7)
    };

    const editTriggerPosition = {
        cx: cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + PROCESS_SVG_WIDTH / 3 + (DefaultConfig.dotGap / 2),
        cy: cy + (RETURN_SVG_HEIGHT / 7)
    };

    const onClickOpenInCodeView = () => {
        // setCodeToHighlight(model.position);
    }

    const component: React.ReactElement = (!model?.viewState.collapsed &&
        (
            <g className="return-wrapper">
                <ReturnSVG
                    x={cx - (RETURN_SVG_WIDTH / 2)}
                    y={cy - DefaultConfig.dotGap / 4}
                    text={(model as ReturnStatement).expression?.source}
                    openInCodeView={!isWaitingOnWorkspace && model && model.position && onClickOpenInCodeView}
                />
            </g>
        )
    );

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setConfigWizardOpen(false);
    };

    const onCancel = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setConfigWizardOpen(false);
    }

    React.useEffect(() => {
        if (blockViewState) {
            const draftVS = blockViewState.draft[1] as DraftStatementViewState;
            const overlayFormConfig = getOverlayFormConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            renderAddForm(draftVS.targetPosition, overlayFormConfig as ConfigOverlayFormStatus, onCancel, onSave);
        }
    }, []);

    const onEditClick = () => {
        const overlayFormConfig = getOverlayFormConfig("Return", model.position, WizardType.EXISTING,
            blockViewState, undefined, stSymbolInfo, model);
        renderEditForm(model, model.position, overlayFormConfig as ConfigOverlayFormStatus, onCancel, onSave);
    }

    const onSave = () => {
        setConfigWizardOpen(false);
    }

    return (
        <g className="return-contect-wrapper">
            <VariableName
                variableName={(model as ReturnStatement).expression.source}
                x={cx - (RETURN_SVG_WIDTH * 2 + DefaultConfig.textAlignmentOffset + DefaultConfig.textAlignmentOffset / 4)}
                y={cy}
                key_id={getRandomInt(1000)}
            />
            {component}
            <>
                {(!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (
                    <g
                        className="return-options-wrapper"
                        height={PROCESS_SVG_HEIGHT_WITH_SHADOW}
                        width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW}
                        x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                        y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                    >
                        {!isConfigWizardOpen && (
                            <>
                                <rect
                                    x={cx - (PROCESS_SVG_WIDTH / 3) - DefaultConfig.dotGap * 2}
                                    y={cy + (PROCESS_SVG_HEIGHT / 4)}
                                    className="return-rect"
                                />
                                <DeleteBtn
                                    {...deleteTriggerPosition}
                                    model={model}
                                    onDraftDelete={onDraftDelete}
                                />
                                <EditBtn
                                    {...editTriggerPosition}
                                    model={model}
                                    onHandleEdit={onEditClick}
                                />
                            </>
                        )}
                    </g>
                )}
            </>
        </g>
    );
}
