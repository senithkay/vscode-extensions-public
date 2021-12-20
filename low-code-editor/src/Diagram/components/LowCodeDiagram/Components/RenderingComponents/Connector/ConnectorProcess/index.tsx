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

import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, LocalVarDecl, NodePosition, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { Context } from "../../../../../../../Contexts/Diagram";
import { getDiagnosticInfo } from "../../../../../../utils";
import { getMatchingConnector } from "../../../../../../utils/st-util";
import { ConnectorConfigWizard } from "../../../../../FormComponents/ConnectorConfigWizard";
import { FormGenerator } from "../../../../../FormComponents/FormGenerator";
import { defaultOrgs } from "../../../../../Portals/utils/constants";
import { DeleteBtn } from "../../../../Components/DiagramActions/DeleteBtn";
import { DELETE_SVG_HEIGHT_WITH_SHADOW, DELETE_SVG_WIDTH_WITH_SHADOW } from "../../../../Components/DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../../../Components/DiagramActions/EditBtn";
import { EDIT_SVG_OFFSET, EDIT_SVG_WIDTH_WITH_SHADOW } from "../../../../Components/DiagramActions/EditBtn/EditSVG";
import { BlockViewState, StatementViewState, ViewState } from "../../../../ViewState";
import { DraftStatementViewState } from "../../../../ViewState/draft";

import { ConnectorProcessSVG, CONNECTOR_PROCESS_SHADOW_OFFSET, CONNECTOR_PROCESS_SVG_HEIGHT, CONNECTOR_PROCESS_SVG_HEIGHT_WITH_SHADOW, CONNECTOR_PROCESS_SVG_WIDTH, CONNECTOR_PROCESS_SVG_WIDTH_WITH_SHADOW } from "./ConnectorProcessSVG";
import "./style.scss";

export interface ConnectorProcessProps {
    model: STNode;
    blockViewState?: BlockViewState | any;
    selectedConnector?: LocalVarDecl;
    specialConnectorName?: string;
}

export function ConnectorProcess(props: ConnectorProcessProps) {
    const {
        actions: { diagramCleanDraw },
        api: {
            code: {
                gotoSource
            }
        },
        props: {
            syntaxTree,
            stSymbolInfo,
            isMutationProgress,
            isWaitingOnWorkspace,
            isReadOnly,
        },
    } = useContext(Context);

    const { model, blockViewState, specialConnectorName } = props;

    const viewState: ViewState =
        model === null
            ? blockViewState.draft[ 1 ]
            : (model.viewState as StatementViewState);

    const sourceSnippet : string = model?.source;

    const diagnostics = model?.typeData?.diagnostics;

    const diagnosticMsgs = getDiagnosticInfo(diagnostics);

    const errorSnippet = {
        diagnosticMsgs: diagnosticMsgs?.message,
        code: sourceSnippet,
        severity: diagnosticMsgs?.severity
    }

    const x = viewState.bBox.cx - CONNECTOR_PROCESS_SVG_WIDTH / 2;
    const y = viewState.bBox.cy;

    const draftVS: any = viewState as DraftStatementViewState;

    const [ isEditConnector, setIsConnectorEdit ] = useState<boolean>(false);
    // const [isClosed, setIsClosed] = useState<boolean>(false);

    const [ connector, setConnector ] = useState<BallerinaConnectorInfo>(
        specialConnectorName ? null : draftVS.connector
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

    const onConnectorFormClose = () => {
        if (blockViewState && blockViewState.draft && specialConnectorName) {
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
    if (isLocalVariableDecl && STKindChecker.isCaptureBindingPattern(model.typedBindingPattern.bindingPattern)) {
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
                    onCancel: onWizardClose,
                },
                isLoading: true,
            } }
        />
    );

    const onClickOpenInCodeView = () => {
        if (model) {
            const position: NodePosition = model.position as NodePosition;
            gotoSource({ startLine: position.startLine, startColumn: position.startColumn });
        }
    }

    const connectorWizard = (
        <ConnectorConfigWizard
            connectorInfo={connector}
            position={ {
                x: viewState.bBox.cx + 80,
                y: viewState.bBox.cy,
            } }
            targetPosition={draftVS.targetPosition}
            selectedConnector={draftVS.selectedConnector}
            specialConnectorName={specialConnectorName}
            model={model}
            onClose={onConnectorFormClose}
            onSave={onWizardClose}
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
                    sourceSnippet={sourceSnippet}
                    diagnostics={errorSnippet}
                    openInCodeView={onClickOpenInCodeView}

                />
                {!model && !connector && !specialConnectorName && connectorList}
                {(connector || specialConnectorName) && connectorWizard}
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
                        <g>
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
                                isReferencedInCode={isReferencedVariable}
                                showOnRight={true}
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
