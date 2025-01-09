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
import { NodePosition, Type } from '@wso2-enterprise/ballerina-core';
import { focusToNode } from './utils/utils';

interface TypeDiagramProps {
    typeModel: Type[];
    selectedRecordId?: string;
    showProblemPanel: () => void;
    goToSource: (filePath: string, position: NodePosition) => void;
    onTypeEdit: (typeId: string) => void;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const { typeModel, showProblemPanel, selectedRecordId, goToSource } = props;

    const [diagramEngine] = useState<DiagramEngine>(createEntitiesEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>(selectedRecordId);
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [focusedNodeId, setFocusedNodeId] = useState<string>(selectedRecordId);

    useEffect(() => {
        drawDiagram();
    }, [typeModel]);

    useEffect(() => {
        if (selectedRecordId !== selectedNodeId) {
            setSelectedNodeId(selectedRecordId);
        }
        setFocusedNodeId(undefined);
    }, [selectedRecordId]);

    const drawDiagram = async () => {
        if (typeModel) {
            setFocusedNodeId(undefined);
            const diagramModel = entityModeller(typeModel);

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
                    } else {
                        diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
                    }

                    // Remove overlay and update model
                    diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof OverlayLayerModel));
                    diagramEngine.setModel(diagramModel);
                    diagramEngine.repaintCanvas();
                }, 200);
            }
        }
    }

    // const defaultOrg = useRef<string>('');

    const styles = useStyles();

    useEffect(() => {
        if (diagramEngine.getCanvas()) {
            function handleEscapePress(event: KeyboardEvent) {
                if (event.key === 'Escape' && selectedNodeId) {
                    setSelectedNodeId(undefined);
                }
            }
            document.addEventListener('keydown', handleEscapePress);
        }
    }, [diagramModel, diagramEngine.getCanvas()]);

    const onTypeEdit = (typeId: string) => {
        console.log("Editing type: ", typeId);
        setSelectedNodeId(typeId);
        props.onTypeEdit(typeId);
    }

    let ctx = {
        selectedNodeId,
        setSelectedNodeId,
        setHasDiagnostics,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
        onEditNode: onTypeEdit,
        goToSource
    }

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId(undefined);
        }
    };

    return (
        <DesignDiagramContext {...ctx}>
            {diagramEngine?.getModel() && diagramModel ?
                <>
                    <DiagramContainer onClick={handleCanvasClick}>
                        <NavigationWrapperCanvasWidget
                            diagramEngine={diagramEngine}
                            className={styles.canvas}
                            focusedNode={diagramEngine?.getModel()?.getNode(selectedNodeId)}
                        />
                    </DiagramContainer>
                    <DiagramControls
                        engine={diagramEngine}
                        refreshDiagram={drawDiagram}
                        showProblemPanel={showProblemPanel}
                    />
                </> :
                <ProgressRing sx={{ color: ThemeColors.PRIMARY }} />
            }
        </DesignDiagramContext>
    );
}
