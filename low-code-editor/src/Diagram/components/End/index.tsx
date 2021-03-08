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

import { STNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getConditionConfig } from "../../utils/diagram-util";
import { BlockViewState, EndViewState } from "../../view-state";
import { DraftStatementViewState } from "../../view-state/draft";
import { DefaultConfig } from "../../visitors/default";
import { EndConfigForm } from "../ConfigForms/EndConfigForms";
import { DeleteBtn } from "../DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_OFFSET, DELETE_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../DiagramActions/EditBtn";
import { EDIT_SVG_HEIGHT_WITH_SHADOW, EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/EditBtn/EditSVG";
// import { ProcessConfig } from "../Portals/ConfigForm/types";

import { StopSVG, STOP_SVG_HEIGHT, STOP_SVG_HEIGHT_WITH_SHADOW, STOP_SVG_SHADOW_OFFSET, STOP_SVG_WIDTH, STOP_SVG_WIDTH_WITH_SHADOW } from "./StopSVG";
import "./style.scss";

export interface EndProps {
    viewState?: EndViewState;
    model?: STNode;
    blockViewState?: BlockViewState;
}

export function End(props: EndProps) {
    const {
        state: {
            syntaxTree,
            isMutationProgress,
            isWaitingOnWorkspace,
            stSymbolInfo,
            isReadOnly,
            setCodeLocationToHighlight: setCodeToHighlight,
            maximize: maximizeCodeView,
            closeConfigOverlayForm: dispatchCloseConfigOverlayForm,
            dispactchConfigOverlayForm: openNewReturnConfigForm,
            currentApp,
            isCodeEditorActive
        },
        diagramCleanDraw
    } = useContext(DiagramContext);
    const { id: appId } = currentApp || {};

    const { viewState, model, blockViewState } = props;
    const isDraftStatement: boolean = blockViewState
        && blockViewState.draft[1] instanceof DraftStatementViewState;

    const [isConfigWizardOpen, setConfigWizardOpen] = useState(false);
    const [endConfigFormOverlayState, setEndConfigFormOverlayState] = useState(undefined);

    const compType = "END";
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
        cx: cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET,
        cy: cy + (STOP_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2)
    };

    const editTriggerPosition = {
        cx: cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET,
        cy: cy + (STOP_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2)
    };

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
    };
    const onCancel = () => {
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    const onReturnEditClick = () => {
        setConfigWizardOpen(true);
        const configOverrlayState = getConditionConfig('Return', model.position, WizardType.EXISTING, model.viewState, undefined, stSymbolInfo, model);
        setEndConfigFormOverlayState(configOverrlayState);
        openNewReturnConfigForm('Return', model.position, WizardType.EXISTING, model.viewState, undefined, stSymbolInfo, model);
    }

    const onSave = () => {
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    let codeSnippet = "No return statement"

    if (model) {
        codeSnippet = model.source
    }

    const onClickOpenInCodeView = () => {
        maximizeCodeView("home", "vertical", appId);
        setCodeToHighlight(model?.position)
    }

    const draftVS = blockViewState?.draft[1] as DraftStatementViewState

    const component: React.ReactElement = ((!model?.viewState.collapsed || blockViewState) &&
        (
            <g className="end-wrapper" data-testid="end-block">
                <StopSVG
                    x={cx - (STOP_SVG_WIDTH_WITH_SHADOW / 2)}
                    y={cy - DefaultConfig.shadow}
                    text={compType.toUpperCase()}
                    codeSnippet={codeSnippet}
                    openInCodeView={!isCodeEditorActive && !isWaitingOnWorkspace && model && model?.position && appId && onClickOpenInCodeView}
                />
                {blockViewState || model ?
                    (<>
                        {
                            (!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
                                className="end-options-wrapper"
                                height={STOP_SVG_HEIGHT_WITH_SHADOW}
                                width={STOP_SVG_HEIGHT_WITH_SHADOW}
                                x={cx - (STOP_SVG_SHADOW_OFFSET / 2)}
                                y={cy - (STOP_SVG_SHADOW_OFFSET / 2)}
                            >
                                <rect
                                    x={cx - (STOP_SVG_WIDTH / 4)}
                                    y={cy + (STOP_SVG_HEIGHT / 4)}
                                    className="end-rect"
                                />

                                {isConfigWizardOpen && endConfigFormOverlayState &&
                                    <EndConfigForm
                                        position={{
                                            x: model.viewState.bBox.cx + STOP_SVG_WIDTH,
                                            y: model.viewState.bBox.cy,
                                        }}
                                        onCancel={onCancel}
                                        wizardType={WizardType.EXISTING}
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
