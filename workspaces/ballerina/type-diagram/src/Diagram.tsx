/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useState } from 'react';
import { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { NavigationWrapperCanvasWidget, ProgressRing, ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { createEntitiesEngine, entityModeller } from './utils';

import { DiagramContainer, useStyles } from './utils/CanvasStyles';

import './resources/assets/font/fonts.css';

import { dagreEngine } from './resources/constants';
import { DesignDiagramContext } from './components/common';
import { DiagramControls } from './components/Controls/DiagramControls';
import { OverlayLayerModel } from './components/OverlayLoader';
import { Type } from '@wso2-enterprise/ballerina-core';
import { focusToNode } from './utils/utils';
import { graphqlModeller } from './utils/model-mapper/entityModelMapper';

interface TypeDiagramProps {
    typeModel: Type[];
    rootService?: Type;
    isGraphql?: boolean;
    selectedNodeId?: string;
    focusedNodeId?: string;
    updateFocusedNodeId?: (nodeId: string) => void;
    showProblemPanel?: () => void;
    goToSource: (node: Type) => void
    onTypeEdit: (typeId: string, isGraphqlRoot?: boolean) => void;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const { typeModel, showProblemPanel, selectedNodeId, goToSource, focusedNodeId, updateFocusedNodeId, rootService, isGraphql } = props;

    const [diagramEngine] = useState<DiagramEngine>(createEntitiesEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [selectedDiagramNode, setSelectedDiagramNode] = useState<string>(selectedNodeId);

    useEffect(() => {
        drawDiagram(focusedNodeId);
    }, [typeModel, focusedNodeId]);

    useEffect(() => {
        setSelectedDiagramNode(selectedNodeId);
    }, [selectedNodeId]);

    const drawDiagram = (focusedNode?: string) => {
        if(isGraphql && rootService) { // TODO: Refactor for graphql and types
            const diagramModel = graphqlModeller(rootService, typeModel);
            console.log("diagramModel", diagramModel);

            if (diagramModel) {
                diagramModel.addLayer(new OverlayLayerModel());
                diagramEngine.setModel(diagramModel);
                setDiagramModel(diagramModel);

                // Always distribute first to properly layout the diagram
                setTimeout(() => {
                    dagreEngine.redistribute(diagramEngine.getModel());

                    if (selectedNodeId) {
                        const selectedModel = diagramEngine.getModel().getNode(selectedNodeId);
                        focusToNode(selectedModel, diagramEngine.getModel().getZoomLevel(), diagramEngine);
                    } else if (diagramEngine?.getCanvas()?.getBoundingClientRect) {
                        diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
                    }

                    // Remove overlay and update model
                    diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof OverlayLayerModel));
                    diagramEngine.setModel(diagramModel);
                    diagramEngine.repaintCanvas();
                }, 300);
            }
        }
        if (typeModel && !isGraphql) {
            const diagramModel = entityModeller(typeModel, focusedNode);

            if (diagramModel) {
                diagramModel.addLayer(new OverlayLayerModel());
                diagramEngine.setModel(diagramModel);
                setDiagramModel(diagramModel);

                // Always distribute first to properly layout the diagram
                setTimeout(() => {
                    dagreEngine.redistribute(diagramEngine.getModel());

                    if (selectedNodeId) {
                        const selectedModel = diagramEngine.getModel().getNode(selectedNodeId);
                        focusToNode(selectedModel, diagramEngine.getModel().getZoomLevel(), diagramEngine);
                    } else if (diagramEngine?.getCanvas()?.getBoundingClientRect) {
                        diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
                    }

                    // Remove overlay and update model
                    diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof OverlayLayerModel));
                    diagramEngine.setModel(diagramModel);
                    diagramEngine.repaintCanvas();
                }, 300);
            }
        }
    }

    // const defaultOrg = useRef<string>('');

    const styles = useStyles();

    const onTypeEdit = (typeId: string, isGraphqlRoot?: boolean) => {
        console.log("Editing type: ", typeId, isGraphqlRoot);
        // setSelectedNodeId(typeId);
        props.onTypeEdit(typeId, isGraphqlRoot);
    }

    const updateSelectionOnDiagram = (nodeId: string) => {
        setSelectedDiagramNode(nodeId);
    }

    let ctx = {
        selectedNodeId: selectedDiagramNode,
        setSelectedNodeId: updateSelectionOnDiagram,
        setHasDiagnostics,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId: updateFocusedNodeId,
        onEditNode: onTypeEdit,
        goToSource
    }

    const refreshDiagram = () => {
        drawDiagram(focusedNodeId);
    };

    return (
        <DesignDiagramContext {...ctx}>
            {diagramEngine?.getModel() && diagramModel ?
                <>
                    <DiagramContainer>
                        <NavigationWrapperCanvasWidget
                            diagramEngine={diagramEngine}
                            className={styles.canvas}
                            focusedNode={diagramEngine?.getModel()?.getNode(selectedDiagramNode)}
                        />
                    </DiagramContainer>
                    <DiagramControls
                        engine={diagramEngine}
                        refreshDiagram={refreshDiagram}
                        showProblemPanel={showProblemPanel}
                    />
                </> :
                <ProgressRing sx={{ color: ThemeColors.PRIMARY }} />
            }
        </DesignDiagramContext>
    );
}
