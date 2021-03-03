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

import { ActionStatement, STNode } from "@ballerina/syntax-tree";

import { WizardType } from "../../../ConfigurationSpec/types";
import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getOverlayFormConfig } from "../../utils/diagram-util";
import { BlockViewState } from "../../view-state";
import { DraftStatementViewState } from "../../view-state/draft";
import { DefaultConfig } from "../../visitors/default";
import { EndConfigForm } from "../ConfigForms/EndConfigForms";
import { DeleteBtn } from "../DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_OFFSET, DELETE_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../DiagramActions/EditBtn";
import { EDIT_SVG_HEIGHT_WITH_SHADOW, EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../DiagramActions/EditBtn/EditSVG";
import { PROCESS_SVG_HEIGHT, PROCESS_SVG_HEIGHT_WITH_SHADOW, PROCESS_SVG_SHADOW_OFFSET, PROCESS_SVG_WIDTH, PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW } from "../Processor/ProcessSVG";

import { RespondSVG, RESPOND_SVG_HEIGHT, RESPOND_SVG_WIDTH_WITH_SHADOW } from "./RespondSVG";
import "./style.scss";

export interface RespondProps {
    model?: STNode;
    blockViewState?: BlockViewState;
}

export function Respond(props: RespondProps) {
    const { state, diagramCleanDraw } = useContext(DiagramContext);
    const {
        syntaxTree,
        stSymbolInfo,
        isWaitingOnWorkspace,
        isMutationProgress,
        isReadOnly,
        isCodeEditorActive,
        currentApp,
        setCodeLocationToHighlight: setCodeToHighlight,
        maximize: maximizeCodeView,
        closeConfigOverlayForm: dispatchCloseConfigOverlayForm,
        closeConfigPanel: dispatchCloseConfigPanel,
        dispactchConfigOverlayForm: openNewEndConfig
    } = state;
    const { id: appId } = currentApp || {};

    const { model, blockViewState } = props;
    const [configOverlayFormState, updateConfigOverlayFormState] = useState(undefined);

    let isEditable = false;
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
            compType = "RESPOND";
        }

        if (model.kind === 'ActionStatement' && (model as ActionStatement).expression.kind === 'CheckAction') {
            isEditable = true;
        }

    } else if (blockViewState) {
        cx = blockViewState.draft[1].bBox.cx;
        cy = blockViewState.draft[1].bBox.cy;
        compType = blockViewState.draft[1].subType.toUpperCase();
    }

    const deleteTriggerPosition = {
        cx: isEditable ? cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET : cx - DELETE_SVG_OFFSET,
        cy: cy + (RESPOND_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2)
    };

    const editTriggerPosition = {
        cx: cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET,
        cy: cy + (RESPOND_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2)
    };

    const onClickOpenInCodeView = () => {
        maximizeCodeView("home", "vertical", appId);
        setCodeToHighlight(model.position)
    }

    const component: React.ReactElement = (!model?.viewState.collapsed &&
        (
            <g className="respond-wrapper">
                <RespondSVG
                    x={cx - (RESPOND_SVG_WIDTH_WITH_SHADOW / 2)}
                    y={cy - DefaultConfig.shadow}
                    text={compType}
                    sourceSnippet={sourceSnippet}
                    openInCodeView={!isCodeEditorActive && !isWaitingOnWorkspace && model && model.position && appId && onClickOpenInCodeView}
                />
            </g>
        )
    );

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
            dispatchCloseConfigOverlayForm();
        }
        setConfigWizardOpen(false);
    };

    const onCancel = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    React.useEffect(() => {
        if (blockViewState) {
            const draftVS = blockViewState.draft[1] as DraftStatementViewState;
            openNewEndConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            const overlayFormConfig = getOverlayFormConfig(draftVS.subType, draftVS.targetPosition, WizardType.NEW,
                blockViewState, undefined, stSymbolInfo);
            updateConfigOverlayFormState(overlayFormConfig);
        }
    }, []);

    // const draftConmpnant = blockViewState?.draft[1] as DraftStatementViewState

    const onEditClick = () => {
        openNewEndConfig("Respond", model.position, WizardType.EXISTING,
            model.viewState, undefined, stSymbolInfo, model);
        const overlayFormConfig = getOverlayFormConfig("Respond", model.position, WizardType.EXISTING,
            blockViewState, undefined, stSymbolInfo, model);
        updateConfigOverlayFormState(overlayFormConfig);
        setConfigWizardOpen(true);
    }

    const onSave = () => {
        setConfigWizardOpen(false);
        dispatchCloseConfigOverlayForm();
    }

    return (
        <g className="respond-contect-wrapper">
            {component}
            <>
                {(!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (<g
                    className="respond-options-wrapper"
                    height={PROCESS_SVG_HEIGHT_WITH_SHADOW}
                    width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW}
                    x={cx - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                    y={cy - (PROCESS_SVG_SHADOW_OFFSET / 2)}
                >
                    {blockViewState && blockViewState.draft && configOverlayFormState &&
                        <EndConfigForm
                            position={{
                                x: cx + PROCESS_SVG_WIDTH,
                                y: cy,
                            }}
                            onCancel={onCancel}
                            wizardType={WizardType.NEW}
                            onSave={onSave}
                            configOverlayFormStatus={configOverlayFormState}
                        />
                    }
                    {isConfigWizardOpen && configOverlayFormState &&
                        <EndConfigForm
                            position={{
                                x: cx + PROCESS_SVG_WIDTH,
                                y: cy,
                            }}
                            onCancel={onCancel}
                            wizardType={WizardType.EXISTING}
                            onSave={onSave}
                            configOverlayFormStatus={configOverlayFormState}
                        />
                    }
                    {!isConfigWizardOpen && (
                        <>
                            <rect
                                x={cx - (PROCESS_SVG_WIDTH / 3)}
                                y={cy + (PROCESS_SVG_HEIGHT / 4)}
                                className="respond-rect"
                            />
                            {!isEditable &&
                                <DeleteBtn
                                    {...deleteTriggerPosition}
                                    model={model}
                                    onDraftDelete={onDraftDelete}
                                />}
                            {isEditable &&
                                <>
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
                                </>}
                        </>
                    )}
                </g>)}
            </>
        </g>
    );
}
