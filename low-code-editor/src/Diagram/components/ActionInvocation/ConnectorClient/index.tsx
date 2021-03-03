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
// import { connect } from "react-redux";

import { CaptureBindingPattern, LocalVarDecl, STKindChecker, STNode } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context as DiagramContext } from "../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../Definitions/lang-client-extended";
import { getMatchingConnector } from "../../../utils/st-util";
import { BlockViewState, StatementViewState, ViewState } from "../../../view-state";
import { DraftStatementViewState } from "../../../view-state/draft";
import { ConnectorConfigWizard } from "../../ConnectorConfigWizard";
import { DeleteBtn } from "../../DiagramActions/DeleteBtn";
import {
    DELETE_SVG_HEIGHT_WITH_SHADOW,
    DELETE_SVG_OFFSET,
    DELETE_SVG_WIDTH_WITH_SHADOW
} from "../../DiagramActions/DeleteBtn/DeleteSVG";
import { EditBtn } from "../../DiagramActions/EditBtn";
import {
    EDIT_SVG_HEIGHT_WITH_SHADOW,
    EDIT_SVG_OFFSET,
    EDIT_SVG_WIDTH_WITH_SHADOW
} from "../../DiagramActions/EditBtn/EditSVG";
import { getConnectorIcon } from "../../Portals/utils";

import {
    CLIENT_RADIUS,
    CLIENT_SHADOW_OFFSET,
    CLIENT_SVG_HEIGHT,
    CLIENT_SVG_HEIGHT_WITH_SHADOW,
    CLIENT_SVG_WIDTH,
    CLIENT_SVG_WIDTH_WITH_SHADOW,
    ConnectorSVG
} from "./ConnectorClientSVG";
import "./style.scss";

export interface ConnectorClientProps {
    // syntaxTree: STNode;
    model: STNode;
    blockViewState?: BlockViewState | any;
    // connectors: BallerinaConnectorsInfo[];
    // stSymbolInfo: STSymbolInfo;
    // isMutationProgress: boolean;
    // isWaitingOnWorkspace: boolean;
}

export function ConnectorClientC(props: ConnectorClientProps) {
    const {
        state: {
            syntaxTree,
            stSymbolInfo,
            isMutationProgress,
            isWaitingOnWorkspace,
            connectors,
            isReadOnly
        },
        diagramCleanDraw
    } = useContext(DiagramContext);

    const {
        model, blockViewState
    } = props
    const connectorClientViewState: ViewState = (model === null)
        ? blockViewState.draft[1]
        : model.viewState as StatementViewState;

    const connectorsCollection: BallerinaConnectorsInfo[] = [];
    if (connectors) {
        connectors.forEach((connectorInfo: any) => {
            connectorsCollection.push(connectorInfo);
        });
    }
    const x = connectorClientViewState.bBox.cx - (CLIENT_SVG_WIDTH_WITH_SHADOW / 2);
    const y = connectorClientViewState.bBox.cy - (CLIENT_SHADOW_OFFSET / 2);

    const draftVS: any = connectorClientViewState as DraftStatementViewState;
    let connectorIconId = (model?.viewState as StatementViewState)?.action?.iconId;

    const [isEditConnector, setIsConnectorEdit] = useState<boolean>(false);
    // const [isClosed, setIsClosed] = useState<boolean>(false);
    const [connector, setConnector] = useState<BallerinaConnectorsInfo>(draftVS.connector);

    if (model === null) {
        connectorIconId = `${draftVS.connector.module}_${draftVS.connector.name}`;
    }

    const toggleSelection = () => {
        const actionInvo: LocalVarDecl = model as LocalVarDecl;
        setConnector(getMatchingConnector(actionInvo, connectors, stSymbolInfo));
        setIsConnectorEdit(!isEditConnector);
    };

    const isDraftStatement: boolean = connectorClientViewState instanceof DraftStatementViewState;
    const connectorWrapper = isDraftStatement ? cn("main-connector-wrapper active-connector") : cn("main-connector-wrapper connector-client");

    // const connectorDefDeleteMutation = (delModel: STNode): STModification[] => {
    const connectorDefDeleteMutation = (): any => {
        const invokedEPCount: number = 0;
        // const viewState: StatementViewState = delModel.viewState as StatementViewState;
        // const endpointName: string = viewState.action.endpointName;
        // TODO: convert this.
        // symbolInfo.actions.forEach((variableNode: ASTNode) => {
        //     const actionVS: StatementViewState = variableNode.viewState as StatementViewState;
        //     if (actionVS.action.endpointName === endpointName) {
        //         invokedEPCount++;
        //     }
        // });
        if (invokedEPCount === 1) {
            // todo need to change to ST
            // const definitionNode: STNode = stSymbolInfo.endpoints.get(endpointName);
            // const position = definitionNode.position;
            // const modification: ASTModification = {
            //     type: "delete",
            //     ...position
            // };
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
    };

    const iconProps = {
        cx: connectorClientViewState.bBox.cx,
        cy: connectorClientViewState.bBox.cy + CLIENT_RADIUS
    };
    const icon = getConnectorIcon(connectorIconId, iconProps);

    let isReferencedVariable = false;
    const isLocalVariableDecl = model && STKindChecker.isLocalVarDecl(model);
    if (isLocalVariableDecl) {
        const localVarDecl = model as LocalVarDecl;
        const captureBingingPattern = localVarDecl.typedBindingPattern.bindingPattern as CaptureBindingPattern;
        if (stSymbolInfo && stSymbolInfo.variableNameReferences && stSymbolInfo.variableNameReferences?.size
            && stSymbolInfo.variableNameReferences.get(captureBingingPattern.variableName.value)?.length > 0) {
            isReferencedVariable = true;
        }
    }

    // const [isReferencedVariableState] = useState(isReferencedVariable);

    const toolTip = isReferencedVariable ? "API is referred in the code below" : undefined;

    return (
        (
            <g>
                <g className={connectorWrapper}>
                    <ConnectorSVG
                        x={x}
                        y={y}
                    />
                    <g className="icon-wrapper">
                        {icon}
                    </g>

                    <>
                        {
                            (!isReadOnly && !isMutationProgress && !isWaitingOnWorkspace) && (
                                <g
                                    className="connector-options-wrapper"
                                    height={CLIENT_SVG_HEIGHT_WITH_SHADOW}
                                    width={CLIENT_SVG_HEIGHT_WITH_SHADOW}
                                    x={x - (CLIENT_SHADOW_OFFSET / 2)}
                                    y={y - (CLIENT_SHADOW_OFFSET / 2)}
                                >
                                    <rect
                                        x={connectorClientViewState.bBox.cx - (CLIENT_SVG_WIDTH / 4)}
                                        y={connectorClientViewState.bBox.cy + (CLIENT_SVG_HEIGHT / 4)}
                                        className="connector-rect"
                                    />
                                    <g className={isReferencedVariable ? "disable" : ""}>
                                        <DeleteBtn
                                            cx={connectorClientViewState.bBox.cx - (DELETE_SVG_WIDTH_WITH_SHADOW / 2) - DELETE_SVG_OFFSET}
                                            cy={connectorClientViewState.bBox.cy + (CLIENT_SVG_HEIGHT / 2) - (DELETE_SVG_HEIGHT_WITH_SHADOW / 2)}
                                            model={model}
                                            toolTipTitle={toolTip}
                                            isButtonDisabled={isReferencedVariable}
                                            onDraftDelete={onDraftDelete}
                                            createModifications={connectorDefDeleteMutation}
                                        />
                                    </g>
                                    <g className={!isLocalVariableDecl ? "disable" : ""}>
                                        <EditBtn
                                            onHandleEdit={toggleSelection}
                                            model={model}
                                            cx={connectorClientViewState.bBox.cx - (EDIT_SVG_WIDTH_WITH_SHADOW / 2) + EDIT_SVG_OFFSET}
                                            cy={connectorClientViewState.bBox.cy + (CLIENT_SVG_HEIGHT / 2) - (EDIT_SVG_HEIGHT_WITH_SHADOW / 2)}
                                            isButtonDisabled={!isLocalVariableDecl}
                                        />
                                    </g>
                                    <g>
                                        {((model === null || isEditConnector)) && (
                                            <ConnectorConfigWizard
                                                connectorInfo={connector}
                                                position={{
                                                    x: connectorClientViewState.bBox.cx + 80,
                                                    y: connectorClientViewState.bBox.cy,
                                                }}
                                                targetPosition={draftVS.targetPosition}
                                                model={model}
                                                onClose={onWizardClose}
                                            />
                                        )}
                                    </g>
                                </g>
                            )
                        }
                    </>
                </g>
            </g>
        )
    );
}

// const mapStateToProps = () => {
//     return {}
// };

// const mapDispatchToProps = {
//     openNewConnectorConfigWizard: dispatchNewConnectorConfigWizard,
// };

// export const ConnectorClient = connect(mapStateToProps, mapDispatchToProps)(ConnectorClientC);

export const ConnectorClient = ConnectorClientC;
