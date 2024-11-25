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
import { DiagramDimensions, SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { clearSidePanelState, DefaultSidePanelState, SidePanelProvider } from "./sidePanel/SidePanelContexProvider";
import { SidePanel, NavigationWrapperCanvasWidget, Button, Codicon } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './sidePanel';
import styled from "@emotion/styled";
import { Colors, NODE_GAP } from "../resources/constants";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { KeyboardNavigationManager } from "../utils/keyboard-navigation-manager";
import { Diagnostic } from "vscode-languageserver-types";
import { APIResource } from "@wso2-enterprise/mi-syntax-tree/src";
import { GetBreakpointsResponse } from "@wso2-enterprise/mi-core";
import { OverlayLayerWidget } from "./OverlayLoader/OverlayLayerWidget";
import _ from "lodash";
import TryOutView from "./sidePanel/mediators/Tryout";
import TryOutPanel from "./sidePanel/Pages/TryOutPanel";

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


const ButtonContainer = styled.div`
    display: flex;
    justify-content: center;
    gap: 10px;
    align-items: center;
    height: 30px;
`;

namespace S {
    export const Container = styled.div`
        height: 100vh;
        overflow: scroll;
        background-image: radial-gradient(${Colors.SURFACE_CONTAINER} 10%, transparent 0px);
        background-size: 16px 16px;
        background-color: ${Colors.SURFACE_BRIGHT};
    `;

    export const ControlsContainer = styled.div`
        padding: 10px 9px 12px 5px;
        position: fixed;
        margin-top: 20px;
        right: 20px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-tree-indentGuidesStroke);
        border-radius: 4px;
        z-index: 1;
    `;
}

export const SIDE_PANEL_WIDTH = 450;

export function Diagram(props: DiagramProps) {
    const { model, diagnostics, isFaultFlow, isFormOpen } = props;
    const { rpcClient, isLoading, setIsLoading } = useVisualizerContext();
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });
    const [diagramViewStateKey, setDiagramViewStateKey] = useState("");
    const scrollRef = useRef();

    const handleScroll = (e: any) => {
        if (!diagramViewStateKey || diagramViewStateKey === "" || !e?.target?.scrollTop || !e?.target?.scrollLeft) {
            return
        }
        const debounce = _.debounce(() => {
            localStorage.setItem(diagramViewStateKey, JSON.stringify({ scrollPosition: e.target.scrollTop, scrollPositionX: e.target.scrollLeft }));
        }, 300);
        debounce();
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
                scroll.scrollLeft = scroll?.clientWidth > diagramData.flow.dimensions.width ? 0 : (scroll?.clientWidth / 2 - diagramData.flow.dimensions.l / 2);
            }
        }
    }, [diagramViewStateKey, canvasDimensions]);


    const [diagramData, setDiagramData] = useState({
        flow: {
            engine: generateEngine(),
            model: null,
            dimensions: {
                width: 0,
                height: 0,
                l: 0,
                r: 0
            }
        },
        fault: {
            engine: generateEngine(),
            model: null,
            dimensions: {
                width: 0,
                height: 0,
                l: 0,
                r: 0
            }
        }
    });

    const [sidePanelState, setSidePanelState] = useState(DefaultSidePanelState);

    useEffect(() => {
        const { flow, fault } = diagramData;
        const { engine: flowEngine } = flow;
        const { engine: faultEngine } = fault;
        const flows: DiagramData[] = [];

        let flowModel = structuredClone(model);
        if (model.tag !== "sequence") {
            let faultModel = structuredClone(model);
            let faultSequence;
            if (model.tag === "proxy") {
                flowModel = flowModel as Proxy;
                faultModel = faultModel as Proxy;
                faultSequence = faultModel.target.faultSequenceAttribute ? faultModel.target : faultModel.target.faultSequence;
                delete faultModel?.target?.inSequence;
                delete faultModel?.target?.inSequenceAttribute;
                delete faultModel?.target?.outSequence;
                delete faultModel?.target?.outSequenceAttribute;
                delete flowModel?.target?.faultSequence;
                delete flowModel?.target?.faultSequenceAttribute;
            } else {
                flowModel = flowModel as APIResource;
                faultModel = faultModel as APIResource;
                faultSequence = (faultModel as APIResource).faultSequenceAttribute ? faultModel : faultModel.faultSequence;
                delete faultModel?.inSequence;
                delete faultModel?.inSequenceAttribute;
                delete faultModel?.outSequence;
                delete faultModel?.outSequenceAttribute;
                delete flowModel?.faultSequence;
                delete flowModel?.faultSequenceAttribute;
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
            model: flowModel
        });
        updateDiagramData(flows);

        rpcClient?.getVisualizerState().then((state) => {
            if (state && state.identifier !== undefined && state.identifier !== "") {
                setDiagramViewStateKey(`diagramViewState-${props.documentUri}-${state.identifier}`);
            }
        });

        const mouseTrapClient = KeyboardNavigationManager.getClient();
        mouseTrapClient.bindNewKey(['command+z', 'ctrl+z'], async () => {
            setIsLoading(true);
            const undo = await rpcClient.getMiDiagramRpcClient().undo({ path: props.documentUri });
            if (!undo) {
                setIsLoading(false);
            }
        });

        mouseTrapClient.bindNewKey(['command+shift+z', 'ctrl+y', 'ctrl+shift+z'], async () => {
            setIsLoading(true);
            const redo = await rpcClient.getMiDiagramRpcClient().redo({ path: props.documentUri });
            if (!redo) {
                setIsLoading(false);
            }
        });

        return () => {
            mouseTrapClient.resetMouseTrapInstance();
        }

    }, [props.model, props.documentUri, isFaultFlow]);

    // center diagram when side panel is opened
    useEffect(() => {
        const { flow, fault } = diagramData;
        const { engine: flowEngine, dimensions: flowDimensions } = flow;
        const { engine: faultEngine, dimensions: faultDimensions } = fault;

        if (!isFaultFlow) {
            centerDiagram(true, flowEngine, flowDimensions);
        } else {
            centerDiagram(true, faultEngine, faultDimensions);
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
            const { nodes, links, dimensions } = getDiagramData(dataItem.model, currentBreakpoints);
            drawDiagram(nodes as any, links, dataItem.engine, (newModel: DiagramModel) => {
                updatedDiagramData[dataItem.modelType] = {
                    ...diagramData[dataItem.modelType],
                    model: newModel,
                    dimensions: dimensions
                };
                canvasWidth = Math.max(canvasWidth, dimensions.width);
                canvasHeight = Math.max(canvasHeight, dimensions.height);
                initDiagram(newModel, dataItem.engine, dimensions);
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
        const dimensions = sizingVisitor.getdiagramDimensions();

        // run position visitor
        const positionVisitor = new PositionVisitor(dimensions.width);
        traversNode(model, positionVisitor);
        const height = positionVisitor.getSequenceHeight();
        dimensions.height = NODE_GAP.START_Y + height + NODE_GAP.END_Y;

        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor(props.documentUri, model as any, breakpoints);
        traversNode(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links, dimensions };
    };

    const drawDiagram = (nodes: MediatorNodeModel[], links: NodeLinkModel[], diagramEngine: DiagramEngine, setModel: any) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setModel(newDiagramModel);
    };


    const initDiagram = (diagramModel: DiagramModel, diagramEngine: DiagramEngine, dimensions: DiagramDimensions) => {
        const scroll = scrollRef?.current as any;
        const offsetWidth = scroll ? scroll.clientWidth : dimensions.width;
        const diagramZero = -(dimensions.width / 2) + dimensions.l;
        const centerX = (offsetWidth - dimensions.width) / 2;
        diagramEngine.getModel().setOffsetX(offsetWidth >= dimensions.width ? centerX : diagramZero);
        diagramEngine.getModel().setGridSize(50);
        diagramEngine.setModel(diagramModel);
        diagramEngine.repaintCanvas();

        setTimeout(() => {
            if (diagramModel) {
                window.addEventListener("resize", () => {
                    centerDiagram(false, diagramEngine, dimensions);
                });
                centerDiagram(false, diagramEngine, dimensions);
                setTimeout(() => {
                    setIsLoading(false);
                }, 150);
            }
        }, 150);
    };

    const centerDiagram = async (animate = false, diagramEngine: DiagramEngine, dimensions: DiagramDimensions) => {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvas = diagramEngine.getCanvas();
            const canvasBounds = canvas.getBoundingClientRect();

            if (animate) {
                const model = diagramEngine.getModel();
                const zoomLevel = model.getZoomLevel() / 100;
                const currentOffsetX = model.getOffsetX();
                const currentOffsetY = model.getOffsetY();

                const isSidePanelOpen = sidePanelState.isOpen || isFormOpen;
                const offsetAdjX = isSidePanelOpen ? (SIDE_PANEL_WIDTH - 20) : 0;
                const offsetAdjY = -150;
                const node = sidePanelState.node;

                const isAddBtn = node instanceof NodeLinkModel;
                let nodeX, nodeY, nodeWidth, nodeHeight;
                if (node) {
                    const position = isAddBtn ? node.getAddButtonPosition() : node.getPosition();
                    nodeX = position.x * zoomLevel;
                    nodeY = position.y * zoomLevel;
                    nodeWidth = node.nodeWidth * zoomLevel;
                    nodeHeight = node.nodeHeight * zoomLevel;
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
                const scroll = scrollRef?.current as any;
                const offsetWidth = scroll ? scroll.clientWidth : dimensions.width;
                const diagramZero = -(dimensions.width / 2) + dimensions.l;
                const centerX = (offsetWidth - dimensions.width) / 2;
                diagramEngine.getModel().setOffsetX((dimensions.width >= offsetWidth || dimensions.l > offsetWidth / 2 || dimensions.r > offsetWidth / 2) ? diagramZero : centerX);
                diagramEngine.getModel().setOffsetY(0);
                diagramEngine.repaintCanvas();
            }
        }
    };

    const zoom = (type: "in" | "out" | "reset") => {
        const diagramEngine = isFaultFlow ? diagramData.fault.engine : diagramData.flow.engine;
        const model = diagramEngine.getModel();
        const scroll = scrollRef?.current as any;

        if (type === 'reset') {
            const dimensions = isFaultFlow ? diagramData.fault.dimensions : diagramData.flow.dimensions;
            model.setZoomLevel(100);
            centerDiagram(false, diagramEngine, dimensions);
            diagramEngine.repaintCanvas();
            scroll.scrollLeft = scroll?.clientWidth > dimensions.width ? 0 : (scroll?.clientWidth / 2 - dimensions.l / 2);
            return;
        }

        const zoomLevel = type === 'in' ? 1.2 : 0.8

        const oldZoomLevel = model.getZoomLevel();
        const currentZoomLevel = oldZoomLevel * zoomLevel;
        const zoomFactor = currentZoomLevel / 100
        const oldZoomFactor = oldZoomLevel / 100
        model.setZoomLevel(currentZoomLevel)

        const clientWidth = scroll.clientWidth ?? 0
        const clientHeight = scroll?.clientHeight ?? 0

        const widthDiff = clientWidth * zoomFactor - clientWidth * oldZoomFactor
        const heightDiff = clientHeight * zoomFactor - clientHeight * oldZoomFactor

        const xFactor = (clientWidth / 2 - model.getOffsetX()) / oldZoomFactor / clientWidth
        const yFactor = (clientHeight / 2 - model.getOffsetY()) / oldZoomFactor / clientHeight

        model.setOffset(model.getOffsetX() - widthDiff * xFactor, model.getOffsetY() - heightDiff * yFactor)

        diagramEngine.repaintCanvas();
    }
    const handleClose = () => {
        setSidePanelState({
            ...sidePanelState,
            isTryoutOpen: false,
            inputOutput: {},
        });
    };

    return (
        <>
            <S.Container ref={scrollRef} onScroll={handleScroll} data-testid={"diagram-container"}>
                <SidePanelProvider value={{
                    ...sidePanelState,
                    setSidePanelState,
                }}>
                    {isLoading && <OverlayLayerWidget />}

                    {/* controls */}
                    <S.ControlsContainer>
                        <Button appearance="icon" onClick={() => zoom('in')} tooltip="Zoom In" sx={{ marginBottom: '3px' }}>
                            <Codicon name='plus' iconSx={{ fontSize: '18px' }} />
                        </Button>
                        <Button appearance="icon" onClick={() => zoom('out')} tooltip="Zoom Out" sx={{ marginBottom: '3px' }}>
                            <Codicon name='dash' iconSx={{ fontSize: '18px' }} />
                        </Button>
                        <Button appearance="icon" onClick={() => zoom('reset')} tooltip="Reset Zoom">
                            <Codicon name='layout-centered' iconSx={{ fontSize: '18px' }} />
                        </Button>
                    </S.ControlsContainer>
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
                        onClose={() => {
                            clearSidePanelState(sidePanelState);
                        }}
                    >
                        <SidePanelList nodePosition={sidePanelState.nodeRange} trailingSpace={sidePanelState.trailingSpace} documentUri={props.documentUri} />
                    </SidePanel>
                </SidePanelProvider>
            </S.Container >
        </>
    );
}
