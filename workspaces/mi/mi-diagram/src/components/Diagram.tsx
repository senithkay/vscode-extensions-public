/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect, useRef } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import {
    traversNode,
    STNode,
    DiagramService,
    Proxy
} from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { SidePanelProvider } from "./sidePanel/SidePanelContexProvider";
import { SidePanel, NavigationWrapperCanvasWidget } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './sidePanel';
import { OverlayLayerModel } from "./OverlayLoader/OverlayLayerModel";
import styled from "@emotion/styled";
import { Colors, NODE_GAP } from "../resources/constants";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { KeyboardNavigationManager } from "../utils/keyboard-navigation-manager";
import { Diagnostic } from "vscode-languageserver-types";
import { APIResource } from "@wso2-enterprise/mi-syntax-tree/src";
import { GetBreakpointsResponse } from "@wso2-enterprise/mi-core";

export interface DiagramProps {
    model: DiagramService;
    documentUri: string;
    diagnostics?: Diagnostic[];

    // Callbacks for the diagram view
    isFaultFlow?: boolean;
    isFormOpen?: boolean;
}

export enum DiagramType {
    FLOW = "flow",
    FAULT = "fault"
}

interface DiagramData {
    engine: DiagramEngine;
    modelType: DiagramType;
    model: STNode;
}

namespace S {
    export const Container = styled.div`
        height: 100vh;
        overflow: scroll;
        background-image: radial-gradient(${Colors.SURFACE_CONTAINER} 10%, transparent 0px);
        background-size: 16px 16px;
        background-color: ${Colors.SURFACE_BRIGHT};
    `;
}

export const SIDE_PANEL_WIDTH = 450;

export function Diagram(props: DiagramProps) {
    const { model, diagnostics, isFaultFlow, isFormOpen } = props;
    const { rpcClient } = useVisualizerContext();
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [diagramViewStateKey, setDiagramViewStateKey] = useState("");
    const scrollRef = useRef();

    const handleScroll = (e: any) => {
        if (!diagramViewStateKey || diagramViewStateKey === "" || !e?.target?.scrollTop || !e?.target?.scrollLeft) {
            return
        }
        localStorage.setItem(diagramViewStateKey, JSON.stringify({ scrollPosition: e.target.scrollTop, scrollPositionX: e.target.scrollLeft }));
    };

    useEffect(() => {
        if (!diagramViewStateKey || diagramViewStateKey === "") {
            return
        }
        const storedScrollPosition = localStorage.getItem(diagramViewStateKey);
        const scroll = scrollRef?.current as any;
        if (storedScrollPosition) {
            const { scrollPosition: prevScrollPosition, scrollPositionX: prevScrollPositionX } = JSON.parse(storedScrollPosition);
            if (scrollRef.current && 'scrollTop' in scrollRef.current && prevScrollPosition !== undefined) {
                scroll.scrollTop = prevScrollPosition;
            }
            if (scrollRef.current && 'scrollLeft' in scrollRef.current && prevScrollPosition !== undefined) {
                scroll.scrollLeft = prevScrollPositionX;
            } else {
                scroll.scrollLeft = scroll?.scrollWidth / 2 - scroll?.clientWidth / 2;
            }
        }
    }, [diagramViewStateKey, canvasDimensions]);


    const [diagramData, setDiagramData] = useState({
        flow: {
            engine: generateEngine(),
            model: null,
            width: 0,
            height: 0
        },
        fault: {
            engine: generateEngine(),
            model: null,
            width: 0,
            height: 0
        }
    });

    const [sidePanelState, setSidePanelState] = useState({
        // Mediator related
        isOpen: false,
        isEditing: false,
        formValues: {},
        node: undefined,
        nodeRange: undefined,
        trailingSpace: undefined,
        isFormOpen: false,
        pageStack: [],
        currentPageIndex: 0
    });

    useEffect(() => {
        const { flow, fault } = diagramData;
        const { engine: flowEngine } = flow;
        const { engine: faultEngine } = fault;
        const flows: DiagramData[] = [];

        const modelCopy = structuredClone(model);
        if (model.tag !== "sequence") {
            let faultSequence;
            if (modelCopy.tag === "proxy") {
                faultSequence = (model as Proxy).target.faultSequence
                delete (modelCopy as Proxy).target.faultSequence;
            } else {
                faultSequence = (model as APIResource).faultSequence;
                delete (modelCopy as APIResource).faultSequence;
            }

            if (faultSequence) {
                flows.push({
                    engine: faultEngine,
                    modelType: DiagramType.FAULT,
                    model: faultSequence
                });
            }
        }

        flows.push({
            engine: flowEngine,
            modelType: DiagramType.FLOW,
            model: modelCopy
        });
        updateDiagramData(flows);

        rpcClient?.getVisualizerState().then((state) => {
            if (state && state.identifier !== undefined && state.identifier !== "") {
                setDiagramViewStateKey(`diagramViewState-${props.documentUri}-${state.identifier}`);
            }
        });

        const mouseTrapClient = KeyboardNavigationManager.getClient();
        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], async () => {
            rpcClient.getMiDiagramRpcClient().undo({ path: props.documentUri });
        });

        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y', 'ctrl+shift+z'], async () => {
            rpcClient.getMiDiagramRpcClient().redo({ path: props.documentUri });
        });

        return () => {
            mouseTrapClient.resetMouseTrapInstance();
        }

    }, [props.model, props.documentUri, isFaultFlow]);

    // center diagram when side panel is opened
    useEffect(() => {
        const { flow, fault } = diagramData;
        const { model: flowModel, engine: flowEngine, width: flowWidth, height: flowHeight } = flow;
        const { model: faultModel, engine: faultEngine, width: faultWidth, height: faultHeight } = fault;

        if (!isFaultFlow) {
            centerDiagram(true, flowModel, flowEngine, flowWidth, flowHeight);
        } else {
            centerDiagram(true, faultModel, faultEngine, faultWidth, faultHeight);
        }

    }, [sidePanelState.isOpen, isFormOpen]);

    useEffect(() => {
        if (!isFormOpen) {
            setSidePanelState({ ...sidePanelState, isFormOpen: false });
        }
    }, [isFormOpen]);

    const updateDiagramData = async (data: DiagramData[]) => {
        const updatedDiagramData: any = {};
        let canvasWidth = (scrollRef.current as any).clientWidth;
        let canvasHeight = (scrollRef.current as any).clientHeight;
        let currentBreakpoints: GetBreakpointsResponse = {
            breakpoints: [],
            activeBreakpoint: undefined
        };
        if (rpcClient) {
            currentBreakpoints = await rpcClient.getMiDebuggerRpcClient().getBreakpoints({ filePath: props.documentUri });
        }
        data.forEach((dataItem) => {
            const { nodes, links, width, height } = getDiagramData(dataItem.model, currentBreakpoints);
            drawDiagram(nodes as any, links, dataItem.engine, (newModel: DiagramModel) => {
                updatedDiagramData[dataItem.modelType] = {
                    ...diagramData[dataItem.modelType],
                    model: newModel,
                    width,
                    height
                };
                canvasWidth = Math.max(canvasWidth, width);
                canvasHeight = Math.max(canvasHeight, height);
                initDiagram(newModel, dataItem.engine, width, height);
            });
        });
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
        setDiagramData({
            ...diagramData,
            ...updatedDiagramData
        });
    };

    const getDiagramData = (model: STNode, breakpoints: GetBreakpointsResponse) => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor(diagnostics || []);
        traversNode(model, sizingVisitor);
        const width = sizingVisitor.getSequenceWidth();

        // run position visitor
        const positionVisitor = new PositionVisitor(width);
        traversNode(model, positionVisitor);
        const height = positionVisitor.getSequenceHeight();

        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor(props.documentUri, model as any, breakpoints);
        traversNode(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links, width, height };
    };

    const drawDiagram = (nodes: MediatorNodeModel[], links: NodeLinkModel[], diagramEngine: DiagramEngine, setModel: any) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setModel(newDiagramModel);
    };


    const initDiagram = (diagramModel: DiagramModel, diagramEngine: DiagramEngine, diagramWidth: number, diagramHeight: number) => {
        setTimeout(() => {
            if (diagramModel) {
                window.addEventListener("resize", () => {
                    centerDiagram(false, diagramModel, diagramEngine, diagramWidth, diagramHeight);
                });
                centerDiagram(false, diagramModel, diagramEngine, diagramWidth, diagramHeight);
                setTimeout(() => {
                    removeOverlay(diagramEngine);
                }, 150);
            }
        }, 150);
    };

    const centerDiagram = async (animate = false, diagramModel: DiagramModel, diagramEngine: DiagramEngine, diagramWidth: number, diagramHeight: number) => {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvas = diagramEngine.getCanvas();
            const canvasBounds = canvas.getBoundingClientRect();

            if (animate) {
                const currentOffsetX = diagramEngine.getModel().getOffsetX();
                const currentOffsetY = diagramEngine.getModel().getOffsetY();
                const isSidePanelOpen = sidePanelState.isOpen || isFormOpen;
                const offsetAdjX = isSidePanelOpen ? (SIDE_PANEL_WIDTH - 20) : 0;
                const offsetAdjY = -150;
                const node = sidePanelState.node;

                const isAddBtn = node instanceof NodeLinkModel;
                let nodeX, nodeY, nodeWidth, nodeHeight;
                if (isAddBtn) {
                    const position = node.getAddButtonPosition();
                    nodeX = position.x;
                    nodeY = position.y;
                    nodeWidth = node.nodeWidth;
                    nodeHeight = node.nodeHeight;
                } else if (node) {
                    nodeX = node.position.x;
                    nodeY = node.position.y;
                    nodeWidth = node.nodeWidth;
                    nodeHeight = node.nodeHeight;
                }

                const scroll = scrollRef?.current as any;
                const scrollX = scroll ? scroll.scrollLeft : 0;
                const scrollY = scroll ? scroll.scrollTop : 0;
                const offsetWidth = scroll ? scroll.clientWidth : canvasBounds.width;
                const offsetHeight = scroll ? scroll.clientHeight : canvasBounds.height;
                const centerX = isSidePanelOpen ? - ((currentOffsetX + nodeX + (nodeWidth / 2) - scrollX) - ((offsetWidth - offsetAdjX) / 2)) : 0;
                const centerY = isSidePanelOpen ? - ((currentOffsetY + nodeY + (nodeHeight / 2) - scrollY) - ((offsetHeight) / 2)) + offsetAdjY : 0;

                canvas.style.transition = "transform 0.5s";
                canvas.style.transform = `translate(${centerX}px, ${centerY}px)`;

            } else {
                const centerX = (canvasBounds.width - diagramWidth) / 2;
                diagramEngine.getModel().setOffsetX(centerX);
                diagramEngine.getModel().setGridSize(50);
                diagramEngine.setModel(diagramModel);
                diagramEngine.repaintCanvas();
            }
        }
    };

    const removeOverlay = (diagramEngine: DiagramEngine) => {
        // remove preloader overlay layer
        const overlayLayer = diagramEngine
            .getModel()
            .getLayers()
            .find((layer) => layer instanceof OverlayLayerModel);
        if (overlayLayer) {
            diagramEngine.getModel().removeLayer(overlayLayer);
        }
        diagramEngine.repaintCanvas();
    };

    return (
        <>
            <S.Container ref={scrollRef} onScroll={handleScroll} data-testid={"diagram-container"}>
                <SidePanelProvider value={{
                    ...sidePanelState,
                    setSidePanelState,
                }}>
                    {/* Flow */}
                    {diagramData.flow.engine && diagramData.flow.model && !isFaultFlow &&
                        <DiagramCanvas height={canvasDimensions.height} width={canvasDimensions.width} type="flow">
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramData.flow.engine as any}
                                cursor="Default"
                            />
                        </DiagramCanvas>
                    }

                    {/* Fault sequence */}
                    {diagramData.fault.engine && diagramData.fault.model && isFaultFlow &&
                        <DiagramCanvas height={canvasDimensions.height} width={canvasDimensions.width} type="fault">
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramData.fault.engine as any}
                                cursor="Default"
                            />
                        </DiagramCanvas>
                    }

                    {/* side panel */}
                    <SidePanel
                        isOpen={sidePanelState.isOpen}
                        alignment="right"
                        width={SIDE_PANEL_WIDTH}
                        overlay
                        onClose={() => setSidePanelState({ ...sidePanelState, isOpen: false, isEditing: false, formValues: {}, node: undefined, nodeRange: undefined })}
                    >
                        <SidePanelList nodePosition={sidePanelState.nodeRange} trailingSpace={sidePanelState.trailingSpace} documentUri={props.documentUri} />
                    </SidePanel>
                </SidePanelProvider>
            </S.Container >
        </>
    );
}
