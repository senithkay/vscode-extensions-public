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
import { IDMType, Range } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Visitors/NodeInitVisitor";
import { traversNode } from "../Diagram/utils/st-utils";
import { ImportDataForm } from "./SidePanel/ImportData/ImportDataForm";
import { DataMapperHeader } from "./Header/DataMapperHeader";
import { useDMExpressionBarStore, useDMSearchStore } from "../../store/store";
import { getSubMappingTypes } from "../Diagram/utils/type-utils";
import { isInputNode } from "../Diagram/Actions/utils";
import { SourceNodeType, View } from "./Views/DataMapperView";
import { KeyboardNavigationManager } from "../../utils/keyboard-navigation-manager";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}
export interface MIDataMapperProps {
    fnST: any;
    inputTrees: IDMType[];
    outputTree: IDMType;
    fileContent: string;
    filePath: string;
    configName: string;
    applyModifications: (fileContent: string) => Promise<void>;
}

enum ActionType {
    ADD_VIEW,
    SWITCH_VIEW,
    EDIT_VIEW
}

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

export function InlineDataMapper(props: MIDataMapperProps) {
    const { fnST, inputTrees, outputTree, fileContent, filePath, configName, applyModifications } = props;

    const initialView = [{
        targetFieldFQN: "",
        sourceFieldFQN: "",
        sourceNodeType: SourceNodeType.InputNode,
        label: "TYPE_NAME"
    }];

    const [views, dispatch] = useReducer(viewsReducer, initialView);
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const { rpcClient } = useRpcContext();
    const { resetSearchStore } = useDMSearchStore();
    const { resetFocus: resetExprBarFocus } = useDMExpressionBarStore();

    const addView = useCallback((view: View) => {
        dispatch({ type: ActionType.ADD_VIEW, payload: { view } });
        resetSearchStore();
        resetExprBarFocus();
    }, [resetSearchStore, resetExprBarFocus]);

    const switchView = useCallback((navigateIndex: number) => {
        dispatch({ type: ActionType.SWITCH_VIEW, payload: { index: navigateIndex } });
        resetSearchStore();
        resetExprBarFocus();
    }, [resetSearchStore, resetExprBarFocus]);

    const editView = useCallback((newData: View) => {
        dispatch({ type: ActionType.EDIT_VIEW, payload: { view: newData } });
        resetSearchStore();
        resetExprBarFocus();
    }, [resetSearchStore, resetExprBarFocus]);

    const inputNode = nodes.find(node => isInputNode(node));

    useEffect(() => {
        generateNodes();
        setupKeyboardShortcuts();
    
        return () => {
            KeyboardNavigationManager.getClient().resetMouseTrapInstance();
        };
    }, [fileContent, views]);

    const generateNodes = async () => {
        const lastView = views[views.length - 1];
        const subMappingTypes = await getSubMappingTypes(rpcClient, filePath, fnST.getName());
        const context = new DataMapperContext(
            fnST, fnST, inputTrees, outputTree, views, subMappingTypes, addView, goToSource, applyModifications
        );
        const nodeInitVisitor = new NodeInitVisitor(context);
    
        if (lastView.subMappingInfo !== undefined) {
            // await handleSubMapping(lastView, context, nodeInitVisitor, subMappingTypes);
        } else {
            handleDefaultMapping(lastView, context, nodeInitVisitor);
        }
    };

    const setupKeyboardShortcuts = () => {
        const mouseTrapClient = KeyboardNavigationManager.getClient();
        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], () => handleVersionChange('dmUndo'));
        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y'], async () => handleVersionChange('dmRedo'));
    };
    
    const handleDefaultMapping = (
        lastView: View,
        context: DataMapperContext,
        nodeInitVisitor: NodeInitVisitor
    ) => {
        let focusedST: any = fnST;
        if (views.length > 1) {
            // focusedST = getFocusedST(lastView, fnST);
            focusedST = undefined;
        }
        context.focusedST = focusedST;
        traversNode(focusedST, nodeInitVisitor);
        setNodes(nodeInitVisitor.getNodes());
    };

    const goToSource = (range: Range) => {
        // rpcClient.getMiVisualizerRpcClient().goToSource({ filePath, position: range });
    };

    const handleVersionChange = async (action: 'dmUndo' | 'dmRedo') => {
        // const lastSource = await rpcClient.getMiDataMapperRpcClient()[action]();
        // if (lastSource) {
        //     await updateFileContent(lastSource);
        // }
    };

    const updateFileContent = async (content: string) => {
        // await rpcClient.getMiDataMapperRpcClient().updateFileContent({ filePath, fileContent: content });
    };

    return (
        <div className={classes.root}>
            {fnST && (
                <DataMapperHeader
                    filePath={filePath}
                    views={views}
                    switchView={switchView}
                    hasEditDisabled={false}
                    onClose={undefined}
                    applyModifications={applyModifications}
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
        </div>
    )
}
