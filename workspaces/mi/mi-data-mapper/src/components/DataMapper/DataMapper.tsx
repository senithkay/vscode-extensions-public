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
import { traversNode } from "../Diagram/utils/st-utils";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { FunctionDeclaration, PropertyAssignment } from "ts-morph";
import { ImportDataForm } from "./SidePanel/ImportDataForm";
import { useDMSearchStore, useDMSidePanelStore } from "../../store/store";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { FocusedSTFindingVisitor } from "../Visitors/FocusedSTFindingVisitor";

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
    index?: number;
}

export interface MIDataMapperProps {
    fnST: FunctionDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
    fileContent: string;
    goToSource: (range: Range) => void;
    applyModifications: () => void;
    filePath: string;
    configName: string;
}

export function MIDataMapper(props: MIDataMapperProps) {
    const {
        fnST,
        inputTrees,
        outputTree,
        fileContent,
        goToSource,
        applyModifications,
        configName,
        filePath
    } = props;
    const [views, setViews] = useState<View[]>([{
        targetFieldFQN: "",
        sourceFieldFQN: "",
        label: `${inputTrees[0].typeName} -> ${outputTree.typeName}`
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
            let focusedST: FunctionDeclaration | PropertyAssignment = fnST;
    
            if (views.length > 1) {
                const focusedView = views[views.length - 1];
                const focusedSTFindingVisitor = new FocusedSTFindingVisitor(focusedView.targetFieldFQN);
                traversNode(fnST, focusedSTFindingVisitor);
                focusedST = focusedSTFindingVisitor.getResolvedNode();
            }

            const context = new DataMapperContext(
                fnST, focusedST, inputTrees, outputTree, views, addView, goToSource, applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context);
            traversNode(focusedST, nodeInitVisitor);
            setNodes(nodeInitVisitor.getNodes());
        }
        generateNodes();
        rpcClient.getMiDataMapperRpcClient().updateDMCFileContent({
            dmName: configName,
            sourcePath: filePath
        });
    }, [fileContent, views]);

    return (
        <div className={classes.root}>
            {fnST && (
                <DataMapperHeader
                    views={views}
                    switchView={switchView}
                    hasEditDisabled={false}
                    onConfigOpen={undefined}
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
