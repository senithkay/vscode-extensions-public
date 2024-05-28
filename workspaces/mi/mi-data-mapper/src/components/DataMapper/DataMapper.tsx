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
import { getFocusedST, getFocusedSubMapping, traversNode } from "../Diagram/utils/st-utils";
import { DMType, Range } from "@wso2-enterprise/mi-core";
import { FunctionDeclaration, PropertyAssignment, ReturnStatement } from "ts-morph";
import { ImportDataForm } from "./SidePanel/ImportDataForm";
import { useDMSearchStore, useDMIOConfigPanelStore, useDMSubMappingConfigPanelStore } from "../../store/store";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';
import { getTypeName } from "../Diagram/utils/common-utils";
import { getSubMappingTypes, getTypeForVariable } from "../Diagram/utils/type-utils";
import { getOutputNode } from "../Diagram/utils/node-utils";
import { SubMappingConfigForm } from "./SidePanel/SubMappingConfigForm";

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
    subMappingIndex?: number;
}

export interface MIDataMapperProps {
    fnST: FunctionDeclaration;
    inputTrees: DMType[];
    outputTree: DMType;
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

    const {
        isIOConfigPanelOpen,
        ioConfigPanelType,
        isSchemaOverridden,
        setIsIOConfigPanelOpen
    } = useDMIOConfigPanelStore(state => ({
            isIOConfigPanelOpen: state.isIOConfigPanelOpen,
            ioConfigPanelType: state.ioConfigPanelType,
            isSchemaOverridden: state.isSchemaOverridden,
            setIsIOConfigPanelOpen: state.setIsIOConfigPanelOpen
        })
    );

    const {
        subMappingConfig: { isSMConfigPanelOpen },
        resetSubMappingConfig
    } = useDMSubMappingConfigPanelStore(state => ({
            subMappingConfig: state.subMappingConfig,
            resetSubMappingConfig: state.resetSubMappingConfig
        })
    );

    const { rpcClient } = useVisualizerContext();
    const { resetSearchStore } = useDMSearchStore();

    const addView = (view: View) => {
        setViews(prev => [...prev, view]);
        resetSearchStore();
    };

    const switchView = (navigateIndex: number) => {
        setViews(prev => {
            const newViews = prev.slice(0, navigateIndex + 1);
            return newViews;
        });
        resetSearchStore();
    };

    useEffect(() => {
        async function generateNodes() {
            const lastView = views[views.length - 1];

            const context = new DataMapperContext(
                fnST, fnST, inputTrees, outputTree, views, filePath, rpcClient, addView, goToSource, applyModifications
            );

            const nodeInitVisitor = new NodeInitVisitor(context);

            if (lastView.subMappingIndex !== undefined) {
                let focusedST = getFocusedSubMapping(lastView.subMappingIndex, fnST);
                context.focusedST = focusedST;

                const varDecl = focusedST.getDeclarations()[0];
                const subMappingTypes = await getSubMappingTypes(rpcClient, filePath, fnST.getName());
                const subMappingType = getTypeForVariable(subMappingTypes, varDecl);

                traversNode(focusedST, nodeInitVisitor);

                const inputNode = nodeInitVisitor.getInputNode();
                const intermediateNodes = nodeInitVisitor.getIntermediateNodes();
                const outputNode = getOutputNode(context, varDecl.getInitializer(), subMappingType);

                setNodes([inputNode, outputNode, ...intermediateNodes]);
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

    const onCloseIOConfigPanel = () => {
        setIsIOConfigPanelOpen(false);
    };

    const onCloseSMConfigPanel = () => {
        resetSubMappingConfig();
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
                isOpen={isIOConfigPanelOpen}
                onCancel={onCloseIOConfigPanel} 
                configName={configName}
                documentUri={filePath}
                ioType={ioConfigPanelType}
                overwriteSchema={isSchemaOverridden}
            />
            <SubMappingConfigForm
                isOpen={isSMConfigPanelOpen}
                functionST={fnST}
                addView={addView}
                applyModifications={applyModifications}
                onCancel={onCloseSMConfigPanel}
            />
        </div>
    )
}
