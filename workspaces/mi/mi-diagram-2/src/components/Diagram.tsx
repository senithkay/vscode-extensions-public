/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { APIResource, traversNode, STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { SidePanelProvider } from "./sidePanel/SidePanelContexProvider";
import { SidePanel, NavigationWrapperCanvasWidget, Switch } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './sidePanel';
import { OverlayLayerModel } from "./OverlayLoader/OverlayLayerModel";
import styled from "@emotion/styled";
import { Colors } from "../resources/constants";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { KeyboardNavigationManager } from "../utils/keyboard-navigation-manager";
import { Diagnostic } from "vscode-languageserver-types";
import { EditAPIForm, EditResourceForm } from "./Forms/EditResourceForm";
import { EditSequenceForm } from "./Forms/EditSequenceForm";
import { DiagramService, EditableService, ProxyTarget } from "@wso2-enterprise/mi-syntax-tree/src";
import { NodeKindChecker } from "../utils/form";

export interface DiagramProps {
    model: DiagramService;
    documentUri: string;
    diagnostics?: Diagnostic[];
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

type ServiceWithSequences = APIResource | ProxyTarget;

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
    const { model, diagnostics } = props;
    const [diagramDataMap, setDiagramDataMap] = useState(new Map());
    const { rpcClient } = useVisualizerContext();
    const [isTabPaneVisible, setTabPaneVisible] = useState(true);
    const [isSequence, setSequence] = useState(false);
    const [isFaultFlow, setFlow] = useState(false);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 0, height: 0 });

    const toggleFlow = () => {
        setFlow(!isFaultFlow);
    };

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
        nodeRange: undefined,
        mediator: "",
        formValues: {},
        title: "",
        // Service related
        isOpenResource: false,
        isOpenSequence: false,
        serviceData: {},
        onServiceEdit: () => {}
    });

    useEffect(() => {
        const { flow, fault } = diagramData;
        const { engine: flowEngine } = flow;
        const { engine: faultEngine } = fault;
        const flows: DiagramData[] = [];
        const STNode: EditableService = NodeKindChecker.isProxy(model) ? model.descriptionOrTargetOrPublishWSDL[0] : model;

        const modelCopy = structuredClone(model);
        if (NodeKindChecker.isProxy(modelCopy)) {
            delete modelCopy.descriptionOrTargetOrPublishWSDL[0].faultSequence;
        } else {
            delete (modelCopy as ServiceWithSequences).faultSequence;
        }

        if (!NodeKindChecker.isAPIResource(model) && !NodeKindChecker.isProxy(model)) {
            setTabPaneVisible(false);
            setSequence(true);
        }

        const key = JSON.stringify((STNode as ServiceWithSequences).inSequence) + JSON.stringify((STNode as ServiceWithSequences).outSequence);

        // if (diagramDataMap.get(DiagramType.FLOW) !== key && !isFaultFlow) {
            diagramDataMap.set(DiagramType.FLOW, key);
            flows.push({
                engine: flowEngine,
                modelType: DiagramType.FLOW,
                model: modelCopy
            });
            setDiagramDataMap(diagramDataMap);
        // }

        let faultSequence;
        if (NodeKindChecker.isProxy(model)) {
            faultSequence = model.descriptionOrTargetOrPublishWSDL[0].faultSequence;
        } else {
            faultSequence = (model as ServiceWithSequences).faultSequence;
        }
        
        if (faultSequence) {
            const key = JSON.stringify(faultSequence);
            // if (diagramDataMap.get(DiagramType.FAULT) !== key && isFaultFlow) {
                diagramDataMap.set(DiagramType.FAULT, key);
                flows.push({
                    engine: faultEngine,
                    modelType: DiagramType.FAULT,
                    model: faultSequence
                });
                setDiagramDataMap(diagramDataMap);
            // }
        }
        updateDiagramData(flows);

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
        const { model: flowModel, engine: flowEngine, width: flowWidth } = flow;
        const { model: faultModel, engine: faultEngine, width: faultWidth } = fault;

        if (!isFaultFlow) {
            centerDiagram(true, flowModel, flowEngine, flowWidth);
        } else {
            centerDiagram(true, faultModel, faultEngine, faultWidth);
        }

        if (!isSequence) {
            setTabPaneVisible(!sidePanelState.isOpen && !sidePanelState.isOpenResource && !sidePanelState.isOpenSequence);
        }
    }, [sidePanelState.isOpen, sidePanelState.isOpenResource, sidePanelState.isOpenSequence]);

    useEffect(() => {
        setTabPaneVisible(!isSequence);
    }, [isSequence]);

    const updateDiagramData = (data: DiagramData[]) => {
        const updatedDiagramData: any = {};
        let canvasWidth = 0;
        let canvasHeight = 0;
        data.forEach((dataItem) => {
            const { nodes, links, width, height } = getDiagramData(dataItem.model);
            drawDiagram(nodes as any, links, dataItem.engine, (newModel: DiagramModel) => {
                updatedDiagramData[dataItem.modelType] = {
                    ...diagramData[dataItem.modelType],
                    model: newModel,
                    width,
                    height
                };
                canvasWidth = Math.max(canvasWidth, width);
                canvasHeight = Math.max(canvasHeight, height);
                initDiagram(newModel, dataItem.engine, width);
            });
        });
        setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
        setDiagramData({
            ...diagramData,
            ...updatedDiagramData
        });
    };

    const getDiagramData = (model: STNode) => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor(diagnostics || []);
        traversNode(model, sizingVisitor);
        const width = sizingVisitor.getSequenceWidth();

        // run position visitor
        const positionVisitor = new PositionVisitor(width);
        traversNode(model, positionVisitor);
        const height = positionVisitor.getSequenceHeight();

        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor(props.documentUri, model as any);
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


    const initDiagram = (diagramModel: DiagramModel, diagramEngine: DiagramEngine, diagramWidth: number) => {
        setTimeout(() => {
            if (diagramModel) {
                window.addEventListener("resize", () => {
                    centerDiagram(false, diagramModel, diagramEngine, diagramWidth);
                });
                centerDiagram(false, diagramModel, diagramEngine, diagramWidth);
                setTimeout(() => {
                    removeOverlay(diagramEngine);
                }, 150);
            }
        }, 150);
    };

    const centerDiagram = async (animate = false, diagramModel: DiagramModel, diagramEngine: DiagramEngine, diagramWidth: number) => {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvasBounds = diagramEngine.getCanvas().getBoundingClientRect();

            const currentOffsetX = diagramEngine.getModel().getOffsetX();
            const isFormOpen = sidePanelState.isOpenResource || sidePanelState.isOpenSequence;
            const offsetAdj = sidePanelState.isOpen || isFormOpen ? (SIDE_PANEL_WIDTH - 25) : 0;
            const offsetX = + ((canvasBounds.width - diagramWidth - offsetAdj) / 2);

            const step = (offsetX - currentOffsetX) / 10;
            let i = animate ? currentOffsetX : offsetX;
            do {
                i += animate ? step : 0;

                diagramEngine.getModel().setOffsetX(+ i);
                diagramEngine.getModel().setGridSize(50);

                // update diagram
                diagramEngine.setModel(diagramModel);
                diagramEngine.repaintCanvas();
                // Sleep for 500 milliseconds
                await new Promise(resolve => setTimeout(resolve, 10));
            } while (!(i > offsetX - 1 && i < offsetX + 1));
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
            <S.Container>
                <SidePanelProvider value={{
                    ...sidePanelState,
                    setSidePanelState,
                }}>
                    {isTabPaneVisible &&
                        <div style={{
                            width: canvasDimensions.width,
                            minWidth: "100%",
                        }}>
                            <Switch
                                leftLabel="Flow"
                                rightLabel="Fault"
                                checked={isFaultFlow}
                                checkedColor="var(--vscode-button-background)"
                                enableTransition={true}
                                onChange={toggleFlow}
                                sx={{
                                    "margin": "auto",
                                    fontFamily: "var(--font-family)",
                                    fontSize: "var(--type-ramp-base-font-size)",
                                }}
                            /></div>}
                    {/* Flow */}
                    {diagramData.flow.engine && diagramData.flow.model && !isFaultFlow &&
                        <DiagramCanvas height={canvasDimensions.height + 40} width={canvasDimensions.width}>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramData.flow.engine as any}
                                overflow="hidden"
                                cursor="Default"
                            />
                        </DiagramCanvas>
                    }

                    {/* Fault sequence */}
                    {diagramData.fault.engine && diagramData.fault.model && isFaultFlow &&
                        <DiagramCanvas height={canvasDimensions.height + 40} width={canvasDimensions.width}>
                            <NavigationWrapperCanvasWidget
                                diagramEngine={diagramData.fault.engine as any}
                                overflow="hidden"
                                cursor="Default"
                            />
                        </DiagramCanvas>
                    }

                    {/* side panel */}
                    {sidePanelState.isOpen && <SidePanel
                        isOpen={sidePanelState.isOpen}
                        alignmanet="right"
                        width={SIDE_PANEL_WIDTH}
                        overlay={false}
                    >
                        <SidePanelList nodePosition={sidePanelState.nodeRange} documentUri={props.documentUri} />
                    </SidePanel>}

                    {/* Edit forms */}
                    {sidePanelState?.isOpenResource && (
                        <EditResourceForm
                            isOpen={sidePanelState.isOpenResource}
                            resourceData={sidePanelState.serviceData as EditAPIForm}
                            documentUri={props.documentUri}
                            onCancel={() => setSidePanelState({ ...sidePanelState, isOpenResource: false })}
                            onEdit={sidePanelState.onServiceEdit}
                        />
                    )}

                    {sidePanelState?.isOpenSequence && (
                        <EditSequenceForm
                            isOpen={sidePanelState.isOpenSequence}
                            sequenceData={sidePanelState.serviceData as EditSequenceForm}
                            onCancel={() => setSidePanelState({ ...sidePanelState, isOpenSequence: false })}
                            onEdit={sidePanelState.onServiceEdit}
                        />
                    )}
                </SidePanelProvider>
            </S.Container >
        </>
    );
}
