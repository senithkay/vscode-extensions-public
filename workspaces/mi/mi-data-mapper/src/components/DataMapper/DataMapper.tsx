/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useCallback, useEffect, useReducer, useState } from "react";

import { css } from "@emotion/css";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { FunctionDeclaration, PropertyAssignment, ReturnStatement } from "ts-morph";

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Visitors/NodeInitVisitor";
import { getFocusedST, getFocusedSubMapping, traversNode } from "../Diagram/utils/st-utils";
import { ImportDataForm } from "./SidePanel/ImportDataForm";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { useDMSearchStore } from "../../store/store";
import { getTypeName } from "../Diagram/utils/common-utils";
import { getSubMappingTypes, getTypeForVariable } from "../Diagram/utils/type-utils";
import { getOutputNode } from "../Diagram/utils/node-utils";
import { SubMappingConfigForm } from "./SidePanel/SubMappingConfigForm";
import { isInputNode } from "../Diagram/Actions/utils";
import { SourceNodeType, View } from "./Views/DataMapperView";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}
export interface MIDataMapperProps {
    fnST: FunctionDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
    fileContent: string;
    filePath: string;
    configName: string;
    applyModifications: () => void;
};

enum ActionType {
    ADD_VIEW,
    SWITCH_VIEW,
    EDIT_VIEW
};

type ViewState = View[];

type ViewAction = {
    type: ActionType,
    payload: {
        view?: View,
        index?: number
    },
}

function viewsReducer(state: ViewState, action: ViewAction) {
    switch (action.type) {
        case ActionType.ADD_VIEW:
            return [...state, action.payload.view];
        case ActionType.SWITCH_VIEW:
            return state.slice(0, action.payload.index + 1);
        case ActionType.EDIT_VIEW:
            return [...state.slice(0, state.length - 1), action.payload.view];
        default:
            return state;
    }
}

export function MIDataMapper(props: MIDataMapperProps) {
    const { fnST, inputTrees, outputTree, fileContent, filePath, configName, applyModifications } = props;

    const initialView = [{
        targetFieldFQN: "",
        sourceFieldFQN: "",
        sourceNodeType: SourceNodeType.InputNode,
        label: `${getTypeName(inputTrees[0])} -> ${getTypeName(outputTree)}`
    }];

    const [views, dispatch] = useReducer(viewsReducer, initialView);
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const { rpcClient } = useVisualizerContext();
    const { resetSearchStore } = useDMSearchStore();

    const addView = useCallback((view: View) => {
        dispatch({ type: ActionType.ADD_VIEW, payload: {view} });
        resetSearchStore();
    }, [resetSearchStore]);

    const switchView = useCallback((navigateIndex: number) => {
        dispatch({ type: ActionType.SWITCH_VIEW, payload: {index: navigateIndex} });
        resetSearchStore();
    }, [resetSearchStore]);

    const editView = useCallback((newData: View) => {
        dispatch({ type: ActionType.EDIT_VIEW, payload: { view: newData} });
        resetSearchStore();
    }, [resetSearchStore]);

    useEffect(() => {
        async function generateNodes() {
            const lastView = views[views.length - 1];
            const subMappingTypes = await getSubMappingTypes(rpcClient, filePath, fnST.getName());

            const context = new DataMapperContext(
                fnST, fnST, inputTrees, outputTree, views, subMappingTypes, addView, goToSource, applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context);

            if (lastView.subMappingInfo !== undefined) {
                let focusedST = getFocusedSubMapping(lastView.subMappingInfo.index, fnST);
                context.focusedST = focusedST;

                const varDecl = focusedST.getDeclarations()[0];
                const subMappingType = getTypeForVariable(subMappingTypes, varDecl);

                if (subMappingType) {
                    traversNode(focusedST, nodeInitVisitor);

                    const inputNode = nodeInitVisitor.getInputNode();
                    const intermediateNodes = nodeInitVisitor.getIntermediateNodes();
                    const outputNode = getOutputNode(context, varDecl.getInitializer(), subMappingType, true);
    
                    setNodes([inputNode, outputNode, ...intermediateNodes]);
                }
            } else {
                let focusedST: FunctionDeclaration | PropertyAssignment | ReturnStatement = fnST;
    
                if (views.length > 1) {
                    focusedST = getFocusedST(lastView, fnST);
                }

                context.focusedST = focusedST;

                traversNode(focusedST, nodeInitVisitor);
                setNodes(nodeInitVisitor.getNodes());
            }
        }
        generateNodes();
        updateDMCFileContent();
    }, [fileContent, views]);

    const goToSource = (range: Range) => {
        rpcClient.getMiVisualizerRpcClient().goToSource({ filePath, position: range });
    };

    const updateDMCFileContent = () => {
        rpcClient.getMiDataMapperRpcClient().updateDMCFileContent({ dmName: configName, sourcePath: filePath });
    };

    return (
        <div className={classes.root}>
            {fnST && (
                <DataMapperHeader
                    views={views}
                    switchView={switchView}
                    hasEditDisabled={false}
                    onClose={undefined}
                />
            )}
            {nodes.length > 0 && (
                <DataMapperDiagram
                    nodes={nodes}
                    onError={undefined}
                />
            )}
            <ImportDataForm
                configName={configName}
                documentUri={filePath}
            />
            {nodes.length > 0 && (
                <SubMappingConfigForm
                    functionST={fnST}
                    inputNode={nodes.find(node => isInputNode(node))}
                    addView={addView}
                    updateView={editView}
                    applyModifications={applyModifications}
                />
            )}
        </div>
    )
}
