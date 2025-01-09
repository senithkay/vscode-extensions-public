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

import { Container, DiagramContainer, useStyles } from './utils/CanvasStyles';

import './resources/assets/font/fonts.css';

import { dagreEngine } from './resources/constants';
import { DesignDiagramContext } from './components/common';
import { HeaderWidget } from './components/Header/Header';
import { DiagramControls } from './components/Controls/DiagramControls';
import { OverlayLayerModel } from './components/OverlayLoader';
import { NodePosition, Type } from '@wso2-enterprise/ballerina-core';

interface TypeDiagramProps {
    getComponentModel: () => Promise<Type[]>;
    selectedRecordId?: string;
    showProblemPanel: () => void;
    addNewType: () => void;
    goToSource: (filePath: string, position: NodePosition) => void;
    onTypeSelected: (typeId: string) => void;
}

export function TypeDiagram(props: TypeDiagramProps) {
    const { getComponentModel, showProblemPanel, selectedRecordId, addNewType, goToSource } = props;

    const [diagramEngine] = useState<DiagramEngine>(createEntitiesEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string>(selectedRecordId);
    const [hasDiagnostics, setHasDiagnostics] = useState<boolean>(false);
    const [focusedNodeId, setFocusedNodeId] = useState<string>(undefined);

    const styles = useStyles();

    useEffect(() => {
        if (selectedRecordId !== selectedNodeId) {
            setSelectedNodeId(selectedRecordId);
        }
        setFocusedNodeId(undefined);
        refreshDiagram();

    }, [props]);

    useEffect(() => {
        refreshDiagram();
    }, [selectedNodeId]);

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

    const refreshDiagram = async () => {
        const components: Type[] = await getComponentModel();
        if (components) {
            setFocusedNodeId(undefined);
            let typeModel;
            typeModel = entityModeller(components);
            if (typeModel) {
                typeModel.addLayer(new OverlayLayerModel());
                diagramEngine.setModel(typeModel);
                setDiagramModel(typeModel);
                autoDistribute(typeModel);
            }
        }
    }


    const autoDistribute = (model: DiagramModel) => {
        setTimeout(() => {
            dagreEngine.redistribute(diagramEngine.getModel());
            diagramEngine.zoomToFitNodes({ margin: 10, maxZoom: 1 });
            diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof OverlayLayerModel));
            diagramEngine.setModel(model);
        }, 30);
    };

    const onTypeSelected = (typeId: string) => {
        setSelectedNodeId(typeId);
        props.onTypeSelected(typeId);
    }

    let ctx = {
        selectedNodeId,
        setSelectedNodeId: onTypeSelected,
        setHasDiagnostics,
        hasDiagnostics,
        focusedNodeId,
        setFocusedNodeId,
        goToSource
    }

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId(undefined);
        }
    };

    return (
        <Container>
            <DesignDiagramContext {...ctx}>
                <HeaderWidget addNewType={addNewType} />
                <DiagramContainer onClick={handleCanvasClick}>
                    {diagramEngine?.getModel() && diagramModel ?
                        <>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramEngine}
                                className={styles.canvas}
                                focusedNode={diagramEngine?.getModel()?.getNode(focusedNodeId)}
                            />
                            <DiagramControls
                                engine={diagramEngine}
                                refreshDiagram={refreshDiagram}
                                showProblemPanel={showProblemPanel}
                            />
                        </> :
                        <ProgressRing sx={{ color: ThemeColors.PRIMARY }} />
                    }
                </DiagramContainer>
            </DesignDiagramContext>
        </Container>
    );
}
