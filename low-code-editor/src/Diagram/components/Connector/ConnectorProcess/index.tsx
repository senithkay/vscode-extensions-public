/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context } from "../../../../Contexts/Diagram";
import { BallerinaConnectorInfo } from "../../../../Definitions";
import { getMatchingConnector } from "../../../utils/st-util";
import { BlockViewState, StatementViewState, ViewState } from "../../../view-state";
import { DraftStatementViewState } from "../../../view-state/draft";
import { ConnectorConfigWizard } from "../../ConnectorConfigWizard";
import { DeleteBtn } from "../../DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_WIDTH_WITH_SHADOW } from "../../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../DiagramActions/EditBtn";
import { EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../../DiagramActions/EditBtn/EditSVG";
import { FormGenerator } from "../../FormGenerator";
import { defaultOrgs } from "../../Portals/utils/constants";

import { ConnectorProcessSVG, CONNECTOR_PROCESS_SHADOW_OFFSET, CONNECTOR_PROCESS_SVG_HEIGHT, CONNECTOR_PROCESS_SVG_HEIGHT_WITH_SHADOW, CONNECTOR_PROCESS_SVG_WIDTH, CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW } from "./ConnectorProcessSVG";
import "./style.scss";

export interface ConnectorProcessProps {
    model: STNode;
    blockViewState?: BlockViewState | any;
    selectedConnector?: LocalVarDecl;
}

export function ConnectorProcess(props: ConnectorProcessProps) {
    const {
        actions: { diagramCleanDraw },
        props: {
            syntaxTree,
            stSymbolInfo,
            isMutationProgress,
            isWaitingOnWorkspace,
            isReadOnly,
        },
    } = useContext(Context);

    const { model, blockViewState } = props;

    const viewState: ViewState =
        model === null
            ? blockViewState.draft[ 1 ]
            : (model.viewState as StatementViewState);

    const x = viewState.bBox.cx - CONNECTOR_PROCESS_SVG_WIDTH / 2;
    const y = viewState.bBox.cy;

    const draftVS: any = viewState as DraftStatementViewState;

    const [ isEditConnector, setIsConnectorEdit ] = useState<boolean>(false);
    // const [isClosed, setIsClosed] = useState<boolean>(false);
    const [ connector, setConnector ] = useState<BallerinaConnectorInfo>(
        draftVS.connector
    );

    const toggleSelection = () => {
        setIsConnectorEdit(!isEditConnector);
    };

    const isDraftStatement: boolean =
        viewState instanceof DraftStatementViewState;
    const connectorWrapper = isDraftStatement
        ? cn("main-connector-process-wrapper active-connector-processor")
        : cn("main-connector-process-wrapper connector-processor");

    // const connectorDefDeleteMutation = (delModel: STNode): STModification[] => {
    const connectorDefDeleteMutation = (): any => {
        const invokedEPCount: number = 0;
        if (invokedEPCount === 1) {
            return [];
        }
    };

    const onDraftDelete = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
    };

    const onWizardClose = () => {
        if (blockViewState) {
            blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
        setIsConnectorEdit(false);
        setConnector(undefined);
    };

    const onConnectorSelect = (balConnector: BallerinaConnectorInfo) => {
        setConnector(balConnector);
    };

    let isReferencedVariable = false;
    const isLocalVariableDecl = model && STKindChecker.isLocalVarDecl(model);
    const isCaptureBindingPattern = isLocalVariableDecl && STKindChecker.isCaptureBindingPattern(model.typedBindingPattern.bindingPattern);
    if (isCaptureBindingPattern) {
        const captureBingingPattern = (model as LocalVarDecl).typedBindingPattern.bindingPattern as CaptureBindingPattern;
        if (stSymbolInfo?.variableNameReferences?.size &&
            stSymbolInfo.variableNameReferences.get(captureBingingPattern.variableName.value)?.length > 0) {
            isReferencedVariable = true;
        }
    }

    if (isEditConnector && !connector) {
        const connectorInit: LocalVarDecl = model as LocalVarDecl;
        const matchedConnector = getMatchingConnector(connectorInit, stSymbolInfo);
        if (matchedConnector) {
            setConnector(matchedConnector);
        }
    }

    const isSingleFormConnector = connector && connector.package.organization === defaultOrgs.WSO2;
    const toolTip = isReferencedVariable ? "API is referred in the code below" : undefined;

    const connectorList = (
        <FormGenerator
            onCancel={onWizardClose}
            // onSave={onSave}
            configOverlayFormStatus={ {
                formType: "ConnectorList",
                formArgs: {
                    onSelect: onConnectorSelect,
                },
                isLoading: true,
            } }
        />
    );

    const connectorWizard = (
        <ConnectorConfigWizard
            connectorInfo={connector}
            position={ {
                x: viewState.bBox.cx + 80,
                y: viewState.bBox.cy,
            } }
            targetPosition={draftVS.targetPosition}
            selectedConnector={draftVS.selectedConnector}
            model={model}
            onClose={onWizardClose}
            isAction={false}
            isEdit={isEditConnector}
        />
    );

    return (
        <>
            <g className={connectorWrapper}>
                <ConnectorProcessSVG
                    x={viewState.bBox.cx - CONNECTOR_PROCESS_SVG_WIDTH / 2}
                    y={viewState.bBox.cy}
                />
                {!model && !connector && connectorList}
                {connector && connectorWizard}
                { model && !isReadOnly && !isMutationProgress && !isWaitingOnWorkspace && (
                    <g
                        className="connector-process-options-wrapper"
                        height={CONNECTOR_PROCESS_SVG_HEIGHT_WITH_SHADOW}
                        width={CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW}
                        x={x - CONNECTOR_PROCESS_SHADOW_OFFSET / 2}
                        y={y - CONNECTOR_PROCESS_SHADOW_OFFSET / 2}
                    >
                        <rect
                            x={viewState.bBox.cx - CONNECTOR_PROCESS_SVG_WIDTH / 4}
                            y={viewState.bBox.cy + CONNECTOR_PROCESS_SVG_HEIGHT / 4}
                            className="connector-process-rect"
                        />
                        <g className={isReferencedVariable ? "disable" : ""}>
                            <DeleteBtn
                                cx={
                                    viewState.bBox.cx -
                                    DELETE_SVG_WIDTH_WITH_SHADOW +
                                    CONNECTOR_PROCESS_SVG_WIDTH / 4
                                }
                                cy={
                                    viewState.bBox.cy +
                                    CONNECTOR_PROCESS_SVG_HEIGHT / 2 -
                                    DELETE_SVG_HEIGHT_WITH_SHADOW / 3
                                }
                                model={model}
                                toolTipTitle={toolTip}
                                isButtonDisabled={isReferencedVariable}
                                onDraftDelete={onDraftDelete}
                                createModifications={connectorDefDeleteMutation}
                            />
                        </g>
                        <g
                            className={
                                !isLocalVariableDecl || isSingleFormConnector
                                    ? "disable"
                                    : ""
                            }
                        >
                            <EditBtn
                                onHandleEdit={toggleSelection}
                                model={model}
                                cx={
                                    viewState.bBox.cx -
                                    EDIT_SVG_WIDTH_WITH_SHADOW / 2 +
                                    EDIT_SVG_OFFSET
                                }
                                cy={viewState.bBox.cy + CONNECTOR_PROCESS_SVG_HEIGHT / 4}
                                isButtonDisabled={
                                    !isLocalVariableDecl || isSingleFormConnector
                                }
                            />
                        </g>
                    </g>
                ) }
            </g>
        </>
    );
}
