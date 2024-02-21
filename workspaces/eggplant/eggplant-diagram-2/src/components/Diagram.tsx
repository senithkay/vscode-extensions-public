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
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { NavigationWrapperCanvasWidget } from "@wso2-enterprise/ui-toolkit";
import { OverlayLayerModel } from "./OverlayLoader/OverlayLayerModel";
import styled from "@emotion/styled";
import { Colors } from "../resources/constants";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from "@vscode/webview-ui-toolkit/react";

export interface DiagramProps {
    model: any;
    documentUri: string;
}

export enum DiagramType {
    FLOW = "flow",
    FAULT = "fault",
}

interface DiagramData {
    engine: DiagramEngine;
    modelType: DiagramType;
    model: any;
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

const SIDE_PANEL_WIDTH = 450;
export function Diagram(props: DiagramProps) {
    const { model } = props;
    const [diagramDataMap, setDiagramDataMap] = useState(new Map());

    const [diagramData, setDiagramData] = useState({
        flow: {
            engine: generateEngine(),
            model: null,
            width: 0,
            height: 0,
        },
        fault: {
            engine: generateEngine(),
            model: null,
            width: 0,
            height: 0,
        },
    });

    const [sidePanelState, setSidePanelState] = useState({
        isOpen: false,
        isEditing: false,
        nodeRange: undefined,
        mediator: "",
        formValues: {},
        title: "",
    });

    const [activeTab, setActiveTab] = useState<DiagramType>(DiagramType.FLOW);

    useEffect(() => {
        const { flow, fault } = diagramData;
        const { engine: flowEngine } = flow;
        const { engine: faultEngine } = fault;
        const flows: DiagramData[] = [];
        const STNode = model as any;

        const modelCopy = Object.assign({}, model);
        delete (modelCopy as any).faultSequence;
        const key = JSON.stringify((STNode as any).inSequence) + JSON.stringify((STNode as any).outSequence);

        if (diagramDataMap.get(DiagramType.FLOW) !== key && activeTab === DiagramType.FLOW) {
            diagramDataMap.set(DiagramType.FLOW, key);
            flows.push({
                engine: flowEngine,
                modelType: DiagramType.FLOW,
                model: modelCopy,
            });
            setDiagramDataMap(diagramDataMap);
        }

        const faultSequence = (STNode as any).faultSequence;
        if (faultSequence) {
            const key = JSON.stringify(faultSequence);
            if (diagramDataMap.get(DiagramType.FAULT) !== key && activeTab == DiagramType.FAULT) {
                diagramDataMap.set(DiagramType.FAULT, key);
                flows.push({
                    engine: faultEngine,
                    modelType: DiagramType.FAULT,
                    model: faultSequence,
                });
                setDiagramDataMap(diagramDataMap);
            }
        }
        updateDiagramData(flows);
    }, [props.model, props.documentUri, activeTab]);

    // center diagram when side panel is opened
    useEffect(() => {
        const { flow, fault } = diagramData;
        const { model: flowModel, engine: flowEngine, width: flowWidth } = flow;
        const { model: faultModel, engine: faultEngine, width: faultWidth } = fault;

        if (activeTab === DiagramType.FLOW) {
            centerDiagram(true, flowModel, flowEngine, flowWidth);
        } else if (activeTab === DiagramType.FAULT) {
            centerDiagram(true, faultModel, faultEngine, faultWidth);
        }
    }, [sidePanelState.isOpen]);

    const updateDiagramData = (data: DiagramData[]) => {
        const updatedDiagramData: any = {};
        data.forEach((dataItem) => {
            // const { nodes, links, width, height } = getDiagramData(dataItem.model);
            drawDiagram(nodes as any, links, dataItem.engine, (newModel: DiagramModel) => {
                updatedDiagramData[dataItem.modelType] = {
                    ...diagramData[dataItem.modelType],
                    model: newModel,
                    width,
                    height,
                };
                initDiagram(newModel, dataItem.engine, width);
            });
        });
        setDiagramData({
            ...diagramData,
            ...updatedDiagramData,
        });
    };

    const getDiagramData = (model: any) => {
        // run sizing visitor
        // const sizingVisitor = new SizingVisitor();
        // traversNode(model, sizingVisitor);
        // const width = sizingVisitor.getSequenceWidth();

        // run position visitor
        // const positionVisitor = new PositionVisitor(width);
        // traversNode(model, positionVisitor);
        // const height = positionVisitor.getSequenceHeight();

        // run node visitor
        // const nodeVisitor = new NodeFactoryVisitor(props.documentUri);
        // traversNode(model, nodeVisitor);
        // const nodes = nodeVisitor.getNodes();
        // const links = nodeVisitor.getLinks();
        // return { nodes, links, width, height };
    };

    const drawDiagram = (
        nodes: MediatorNodeModel[],
        links: NodeLinkModel[],
        diagramEngine: DiagramEngine,
        setModel: any
    ) => {
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

    const centerDiagram = async (
        animate = false,
        diagramModel: DiagramModel,
        diagramEngine: DiagramEngine,
        diagramWidth: number
    ) => {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvasBounds = diagramEngine.getCanvas().getBoundingClientRect();

            const currentOffsetX = diagramEngine.getModel().getOffsetX();
            const offsetAdj = sidePanelState.isOpen ? SIDE_PANEL_WIDTH - 25 : 0;
            const offsetX = +((canvasBounds.width - diagramWidth - offsetAdj) / 2);

            const step = (offsetX - currentOffsetX) / 10;
            let i = animate ? currentOffsetX : offsetX;
            do {
                i += animate ? step : 0;

                diagramEngine.getModel().setOffsetX(+i);
                diagramEngine.getModel().setGridSize(50);

                // update diagram
                diagramEngine.setModel(diagramModel);
                diagramEngine.repaintCanvas();
                // Sleep for 500 milliseconds
                await new Promise((resolve) => setTimeout(resolve, 10));
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
                <VSCodePanels aria-label="Default">
                    <VSCodePanelTab
                        id={DiagramType.FLOW}
                        onClick={(e: any) => {
                            setActiveTab(e.target.id);
                        }}
                    >
                        Flow
                    </VSCodePanelTab>
                    {(props.model as any).faultSequence && (
                        <VSCodePanelTab
                            id={DiagramType.FAULT}
                            onClick={(e: any) => {
                                setActiveTab(e.target.id);
                            }}
                        >
                            Fault
                        </VSCodePanelTab>
                    )}

                    {/* Flow */}
                    <VSCodePanelView id={DiagramType.FLOW} width={"1000px"}>
                        {diagramData.flow.engine && diagramData.flow.model && (
                            <DiagramCanvas height={diagramData.flow.height + 40}>
                                <NavigationWrapperCanvasWidget diagramEngine={diagramData.flow.engine as any} />
                            </DiagramCanvas>
                        )}
                    </VSCodePanelView>

                    {/* Fault sequence */}
                    {diagramData.fault.engine && diagramData.fault.model && (
                        <VSCodePanelView id={DiagramType.FAULT}>
                            <DiagramCanvas height={diagramData.fault.height + 40}>
                                <NavigationWrapperCanvasWidget diagramEngine={diagramData.fault.engine as any} />
                            </DiagramCanvas>
                        </VSCodePanelView>
                    )}
                </VSCodePanels>
            </S.Container>
        </>
    );
}
