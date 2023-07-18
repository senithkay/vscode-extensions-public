/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { Suspense, useCallback, useContext, useEffect, useState } from 'react';
import { DiagramEngine, DiagramModel } from '@projectstorm/react-diagrams';
import { DagreEngine } from '@projectstorm/react-diagrams-routing';
import { toJpeg } from 'html-to-image';
import debounce from 'lodash.debounce';
import { DiagramControls } from './ControlLayer';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { OverlayLayerModel } from '../OverlayLoader';
import { GatewayLinkModel } from '../../gateway/GatewayLink/GatewayLinkModel';
import { GatewayNodeModel } from '../../gateway/GatewayNode/GatewayNodeModel';
import { ConsoleView, DagreLayout, Views } from '../../../resources';
import {
    addGWNodesModel,
    cellDiagramZoomToFit,
    createEntitiesEngine,
    createServicesEngine,
    positionGatewayNodes,
    removeGWLinks
} from '../../../utils';
import './styles/styles.css';
import { CircularProgress } from "@mui/material";
import { CanvasWidget } from "@projectstorm/react-canvas-core";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";

interface DiagramCanvasProps {
    model: DiagramModel;
    currentView: Views;
    type: Views;
    layout: DagreLayout;
    engine?: DiagramEngine;
}

// Note: Dagre distribution spaces correctly only if the particular diagram screen is visible
let dagreEngine = new DagreEngine({
    graph: {
        rankdir: 'LR',
        ranksep: 175,
        edgesep: 20,
        nodesep: 60,
        ranker: 'longest-path',
        marginx: 40,
        marginy: 40
    }
});

export function DiagramCanvasWidget(props: DiagramCanvasProps) {
    const { model, currentView, layout, type, engine } = props;
    const { editingEnabled, setNewLinkNodes, consoleView, focusedNodeId, setFocusedNodeId } = useContext(DiagramContext);

    const [diagramEngine] = useState<DiagramEngine>(engine || (type === Views.TYPE || type === Views.TYPE_COMPOSITION ?
        createEntitiesEngine : createServicesEngine));
    const [diagramModel, setDiagramModel] = useState<DiagramModel | undefined>(undefined);

    let diagramClass = 'diagram-container';
    if (type === Views.CELL_VIEW && !(consoleView)) {
        diagramClass = 'cell-diagram-container';
    } else if (consoleView === ConsoleView.PROJECT_HOME) {
        diagramClass = 'choreo-project-cell-diagram-container';
    } else if (consoleView === ConsoleView.COMPONENTS) {
        diagramClass = 'choreo-cell-diagram-container';
    }

    const hideGWLinks = () => {
        diagramEngine?.getModel()?.getLinks()?.forEach(link => {
            if (link instanceof GatewayLinkModel) {
                link.fireEvent({ hide: true }, 'updateVisibility');
            }
        });
        positionGatewayNodes(diagramEngine, (consoleView !== undefined));
    };

    const showGWLinks = () => {
        diagramEngine?.getModel()?.getLinks()?.forEach(link => {
            if (link instanceof GatewayLinkModel) {
                link.fireEvent({ hide: false }, 'updateVisibility');
            }
        });
        positionGatewayNodes(diagramEngine, (consoleView !== undefined));
    };

    const onDiagramMoveStarted = debounce(() => {
        hideGWLinks();
    }, 30);

    const onDiagramMoveFinished = debounce(() => {
        showGWLinks();
    }, 30);

    const onWindowDragFinished = debounce(() => {
        showGWLinks();
    }, 1500);

    const onWindowResize = () => {
        if (type === Views.CELL_VIEW && diagramEngine.getModel()) {
            hideGWLinks();
            onWindowDragFinished();
        }
    };

    useEffect(() => {
        if (type === Views.L1_SERVICES && editingEnabled) {
            // Reset new link nodes on escape
            function handleEscapePress(event: KeyboardEvent) {
                if (event.key === 'Escape' && currentView === Views.L1_SERVICES && currentView === type) {
                    setNewLinkNodes({ source: undefined, target: undefined });
                }
            }
            document.addEventListener('keydown', handleEscapePress);
        } else if (type === Views.CELL_VIEW && editingEnabled) {
            window.addEventListener('resize', onWindowResize);
        }
    }, []);

    // Reset the model and redistribute if the model changes
    useEffect(() => {
        if (diagramEngine.getModel()) {
            if (currentView === type) {
                model.addLayer(new OverlayLayerModel());
                diagramEngine.setModel(model);
                autoDistribute();
            } else {
                setDiagramModel(undefined);
            }
        }
    }, [model, layout]);

    // Initial distribution of the nodes when the screen is on display (refer note above)
    useEffect(() => {
        if (!diagramModel && currentView === type) {
            model.addLayer(new OverlayLayerModel());
            diagramEngine.setModel(model);
            setDiagramModel(model);
            autoDistribute();
        }
    }, [currentView]);

    const autoDistribute = () => {
        setTimeout(() => {
            if (dagreEngine.options.graph.ranker !== layout) {
                dagreEngine.options.graph.ranker = layout;
            }
            if (currentView === Views.CELL_VIEW) {
                // Removing GW links on refresh
                removeGWLinks(diagramEngine);
            }
            dagreEngine.redistribute(diagramEngine.getModel());
            if (currentView === Views.CELL_VIEW) {
                const hasGwNode = diagramEngine.getModel().getNodes().find(node => (node instanceof GatewayNodeModel));
                // Adding GW links and nodes after dagre distribution
                addGWNodesModel(diagramEngine, !hasGwNode);
                onDiagramMoveFinished();
            }
            zoomToFit();
            diagramEngine.getModel().removeLayer(diagramEngine.getModel().getLayers().find(layer => layer instanceof OverlayLayerModel));
            diagramEngine.setModel(model);
        }, 30);
    };

    const redrawDiagram = () => {
        if (type === Views.CELL_VIEW) {
            positionGatewayNodes(diagramEngine, (consoleView !== undefined));
        }
        diagramEngine.repaintCanvas();
    };

    const onZoom = (zoomIn: boolean) => {
        let delta: number = zoomIn ? +5 : -5;
        diagramEngine.getModel().setZoomLevel(diagramEngine.getModel().getZoomLevel() + delta);
        redrawDiagram();
    };

    const zoomToFit = () => {
        diagramEngine.zoomToFitNodes({ maxZoom: 1 });
        if (type === Views.CELL_VIEW) {
            cellDiagramZoomToFit(diagramEngine, (consoleView !== undefined));
        }
    };

    const downloadDiagram = useCallback(() => {
        const canvas: HTMLDivElement = diagramEngine.getCanvas();
        if (!canvas) {
            return;
        }

        toJpeg(canvas, { cacheBust: true, quality: 0.95, width: canvas.scrollWidth, height: canvas.scrollHeight })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'project-diagram.jpeg';
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, [diagramEngine.getCanvas()]);

    const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (focusedNodeId && event.target === diagramEngine.getCanvas()) {
            setFocusedNodeId(undefined);
        }
    };

    return (
        <>
            {diagramEngine && diagramEngine.getModel() &&
                <div
                    onMouseDown={type === Views.CELL_VIEW ? onDiagramMoveStarted : undefined}
                    onMouseUp={type === Views.CELL_VIEW ? onDiagramMoveFinished : undefined}
                    onClick={type === Views.TYPE || type === Views.TYPE_COMPOSITION ? handleCanvasClick : undefined}
                >
                    <Suspense fallback={<CircularProgress data-testid="canvas-loader" />} >
                        {type === Views.TYPE || type === Views.TYPE_COMPOSITION ?
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramEngine}
                                className={diagramClass}
                                focusedNode={diagramEngine?.getModel()?.getNode(focusedNodeId)}
                            /> :
                            <CanvasWidget engine={diagramEngine} className={diagramClass} />
                        }
                    </Suspense>
                </div>
            }
            {currentView !== Views.CELL_VIEW && (
                <DiagramControls
                    showDownloadButton={type !== Views.CELL_VIEW}
                    zoomToFit={zoomToFit}
                    onZoom={onZoom}
                    onDownload={downloadDiagram}
                />
            )}
        </>
    );
}
