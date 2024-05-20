/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useState } from "react";

import { css } from "@emotion/css";

import { DataMapperContext } from "../../utils/DataMapperContext/DataMapperContext";
import DataMapperDiagram from "../Diagram/Diagram";

import { DataMapperHeader } from "./Header/DataMapperHeader";
import { DataMapperNodeModel } from "../Diagram/Node/commons/DataMapperNode";
import { NodeInitVisitor } from "../Visitors/NodeInitVisitor";
import { getFocusedST, traversNode } from "../Diagram/utils/st-utils";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { FunctionDeclaration, PropertyAssignment, ReturnStatement, VariableDeclaration } from "ts-morph";
import { ImportDataForm } from "./SidePanel/ImportDataForm";
import { useDMSearchStore, useDMSidePanelStore } from "../../store/store";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getTypeName } from "../Diagram/utils/common-utils";
import { getTypeForVariable } from "../Diagram/utils/type-utils";

const classes = {
    root: css({
        flexGrow: 1,
        height: "100vh",
        overflow: "hidden",
    })
}

export interface View {
    targetFieldFQN: string;
    sourceFieldFQN: string;
    label: string;
    mapFnIndex?: number;
}

export interface MIDataMapperProps {
    fnST: FunctionDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
    variableTypes: Record<string, DMType | undefined>;
    fileContent: string;
    applyModifications: () => void;
    filePath: string;
    configName: string;
}

export function MIDataMapper(props: MIDataMapperProps) {
    const {
        fnST,
        inputTrees,
        outputTree,
        variableTypes,
        fileContent,
        applyModifications,
        configName,
        filePath
    } = props;
    const [views, setViews] = useState<View[]>([{
        targetFieldFQN: "",
        sourceFieldFQN: "",
        label: `${getTypeName(inputTrees[0])} -> ${getTypeName(outputTree)}`
    }]);
    const [nodes, setNodes] = useState<DataMapperNodeModel[]>([]);

    const isSidePanelOpen = useDMSidePanelStore(state => state.sidePanelOpen);
    const setSidePanelOpen = useDMSidePanelStore(state => state.setSidePanelOpen);
    const sidePanelIOType = useDMSidePanelStore(state => state.sidePanelIOType);
    const isSchemaOverridden = useDMSidePanelStore(state => state.isSchemaOverridden);

    const { rpcClient } = useVisualizerContext();
    const { resetSearchStore } = useDMSearchStore();

    const addView = (view: View) => {
        setViews(prev => [...prev, view]);
        resetSearchStore();
    }

    const switchView = (navigateIndex: number) => {
        setViews(prev => {
            const newViews = prev.slice(0, navigateIndex + 1);
            return newViews;
        });
        resetSearchStore();
    }

    useEffect(() => {
        async function generateNodes() {
            let focusedST: FunctionDeclaration | PropertyAssignment | ReturnStatement = fnST;
    
            if (views.length > 1) {
                focusedST = getFocusedST(views[views.length - 1], fnST);
            }

            const context = new DataMapperContext(
                fnST, focusedST, inputTrees, outputTree, views, addView, goToSource, getTypeInfo, applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(focusedST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        }
        generateNodes();
        updateDMCFileContent();
    }, [fileContent, views]);

    const goToSource = (range: Range) => {
        rpcClient.getMiVisualizerRpcClient().goToSource({ filePath, position: range });
    };

    const getTypeInfo = (varDecl: VariableDeclaration) => {
        return getTypeForVariable(variableTypes, varDecl);
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
            <ImportDataForm isOpen={isSidePanelOpen} onCancel={() => setSidePanelOpen(false)} 
                    configName={configName} documentUri={filePath} ioType={sidePanelIOType} overwriteSchema={isSchemaOverridden} />
        </div>
    )
}
