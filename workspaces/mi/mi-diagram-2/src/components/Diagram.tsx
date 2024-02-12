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
import { APIResource, Sequence, traversNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { SizingVisitor } from "../visitors/SizingVisitor";
import { PositionVisitor } from "../visitors/PositionVisitor";
import { generateEngine } from "../utils/diagram";
import { DiagramCanvas } from "./DiagramCanvas";
import { NodeFactoryVisitor } from "../visitors/NodeFactoryVisitor";
import { MediatorNodeModel } from "./nodes/MediatorNode/MediatorNodeModel";
// import { sampleDiagram } from "../utils/sample";
import { NodeLinkModel } from "./NodeLink/NodeLinkModel";
import { SidePanelProvider } from "./sidePanel/SidePanelContexProvider";
import { Button, SidePanel, SidePanelTitleContainer, NavigationWrapperCanvasWidget } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './sidePanel';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';
import { OverlayLayerModel } from "./OverlayLoader/OverlayLayerModel";
import styled from "@emotion/styled";
import { Colors } from "../resources/constants";
import { VSCodePanelTab, VSCodePanelView, VSCodePanels } from '@vscode/webview-ui-toolkit/react';
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";

export interface DiagramProps {
    model: APIResource | Sequence;
    documentUri: string;
}

export enum DiagramType {
    FLOW = "flow",
    FAULT = "fault"
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

    const [flowDiagramEngine] = useState<DiagramEngine>(generateEngine());
    const [flowDiagramModel, setFlowDiagramModel] = useState<DiagramModel | null>(null);
    const [faultSequenceDiagramEngine] = useState<DiagramEngine>(generateEngine());
    const [faultSequenceDiagramModel, setFaultSequenceDiagramModel] = useState<DiagramModel | null>(null);
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [sidePanelnodeRange, setSidePanelNodeRange] = useState<Range>();
    const [sidePanelMediator, setSidePanelMediator] = useState<string>();
    const [sidePanelFormValues, setSidePanelFormValues] = useState<{ [key: string]: any }>();
    const [sidePanelShowBackBtn, setSidePanelShowBackBtn] = useState<boolean>(false);
    const [sidePanelBackBtn, setSidePanelBackBtn] = useState<number>(0);
    const [diagramWidth, setDiagramWidth] = useState<number>(0);
    const [diagramHeight, setDiagramHeight] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<DiagramType>(DiagramType.FLOW);

    useEffect(() => {
        if (model.tag === "resource") {
            if (flowDiagramEngine && activeTab === DiagramType.FLOW) {
                const flowModel = Object.assign({}, model);
                delete (flowModel as APIResource).faultSequence
                const { nodes, links } = getNodes((flowModel as APIResource));
                drawDiagram(nodes as any, links, flowDiagramEngine, setFlowDiagramModel);
            }
            if (faultSequenceDiagramEngine && activeTab === DiagramType.FAULT) {
                const { nodes, links } = getNodes((model as APIResource).faultSequence);
                drawDiagram(nodes as any, links, faultSequenceDiagramEngine, setFaultSequenceDiagramModel);
            }
        }
    }, [props.model, props.documentUri, activeTab]);

    useEffect(() => {
        initDiagram(flowDiagramModel, flowDiagramEngine);
    }, [flowDiagramModel, diagramWidth]);

    useEffect(() => {
        initDiagram(faultSequenceDiagramModel, faultSequenceDiagramEngine);
    }, [faultSequenceDiagramModel, diagramWidth]);

    // center diagram when side panel is opened
    useEffect(() => {
        if (flowDiagramModel) {
            centerDiagram(true, flowDiagramModel, flowDiagramEngine);
        }
        if (faultSequenceDiagramModel) {
            centerDiagram(true, faultSequenceDiagramModel, faultSequenceDiagramEngine);
        }
    }, [isSidePanelOpen]);

    const getNodes = (model: STNode) => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor();
        traversNode(model, sizingVisitor);
        const diagramWidth = sizingVisitor.getSequenceWidth();

        // run position visitor
        const positionVisitor = new PositionVisitor(diagramWidth);
        traversNode(model, positionVisitor);
        const diagramHeight = positionVisitor.getSequenceHeight();
        setDiagramHeight(diagramHeight);
        setDiagramWidth(diagramWidth);

        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traversNode(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links };
    };

    const drawDiagram = (nodes: MediatorNodeModel[], links: NodeLinkModel[], diagramEngine: DiagramEngine, setModel: any) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addLayer(new OverlayLayerModel());
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setModel(newDiagramModel);
    };

    const closeSidePanel = () => {
        setSidePanelNodeRange(undefined);
        setSidePanelMediator(undefined);
        setSidePanelOpen(false);
        setSidePanelFormValues(undefined);
        setIsEditing(false);
    };

    const sidePanelBackClick = () => {
        setSidePanelBackBtn(sidePanelBackBtn + 1);
    };

    return (
        <>
            <S.Container>
                <SidePanelProvider value={{
                    setIsOpen: setSidePanelOpen,
                    isOpen: isSidePanelOpen,
                    setIsEditing: setIsEditing,
                    isEditing: isEditing,
                    setNodeRange: setSidePanelNodeRange,
                    nodeRange: sidePanelnodeRange,
                    setShowBackBtn: setSidePanelShowBackBtn,
                    showBackBtn: sidePanelShowBackBtn,
                    setOperationName: setSidePanelMediator,
                    operationName: sidePanelMediator,
                    setFormValues: setSidePanelFormValues,
                    formValues: sidePanelFormValues,
                    setBackBtn: setSidePanelBackBtn,
                    backBtn: sidePanelBackBtn
                }}>
                    <VSCodePanels aria-label="Default">
                        <VSCodePanelTab id={DiagramType.FLOW} onClick={(e: any) => { setActiveTab(e.target.id) }}>Flow</VSCodePanelTab>
                        <VSCodePanelTab id={DiagramType.FAULT} onClick={(e: any) => { setActiveTab(e.target.id) }}>Fault</VSCodePanelTab>

                        {/* Flow */}
                        <VSCodePanelView id={DiagramType.FLOW} width={"1000px"}>
                            {flowDiagramEngine && flowDiagramModel && (
                                <DiagramCanvas height={diagramHeight + 40}>
                                    <NavigationWrapperCanvasWidget
                                        diagramEngine={flowDiagramEngine as any}
                                        overflow="hidden"
                                        cursor="Default"
                                    />
                                </DiagramCanvas>
                            )}
                        </VSCodePanelView>

                        {/* Fault sequence */}
                        <VSCodePanelView id={DiagramType.FAULT}>
                            {flowDiagramEngine && faultSequenceDiagramModel && (
                                <DiagramCanvas height={diagramHeight + 40}>
                                    <NavigationWrapperCanvasWidget
                                        diagramEngine={faultSequenceDiagramEngine as any}
                                        overflow="hidden"
                                        cursor="Default"
                                    />
                                </DiagramCanvas>
                            )}
                        </VSCodePanelView>

                    </VSCodePanels>

                    {/* side panel */}
                    {isSidePanelOpen && <SidePanel
                        isOpen={isSidePanelOpen}
                        alignmanet="right"
                        width={SIDE_PANEL_WIDTH}
                        overlay={false}
                    >
                        <SidePanelTitleContainer>
                            <div style={{ minWidth: "20px" }}>
                                {
                                    sidePanelShowBackBtn && <Button onClick={sidePanelBackClick} appearance="icon">{"<"}</Button>
                                }
                            </div>
                            {isEditing ? <div>Edit {sidePanelMediator}</div> : <div>Add New</div>}
                            <Button onClick={closeSidePanel} appearance="icon">X</Button>
                        </SidePanelTitleContainer>
                        <SidePanelList nodePosition={sidePanelnodeRange} documentUri={props.documentUri} />
                    </SidePanel>}

                </SidePanelProvider>
            </S.Container >
        </>
    );

    function initDiagram(diagramModel: DiagramModel, diagramEngine: DiagramEngine) {
        setTimeout(() => {
            if (diagramModel) {
                window.addEventListener("resize", () => {
                    centerDiagram(false, diagramModel, diagramEngine);
                });
                centerDiagram(false, diagramModel, diagramEngine);
                setTimeout(() => {
                    removeOverlay(diagramEngine);
                }, 100);
            }
        }, 400);
    }

    async function centerDiagram(animate = false, diagramModel: DiagramModel, diagramEngine: DiagramEngine) {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvasBounds = diagramEngine.getCanvas().getBoundingClientRect();

            const currentOffsetX = diagramEngine.getModel().getOffsetX();
            const offsetAdj = isSidePanelOpen ? (SIDE_PANEL_WIDTH - 25) : 0;
            const offsetX = + ((canvasBounds.width - diagramWidth - offsetAdj) / 2);

            const step = (offsetX - currentOffsetX) / 30;
            let i = animate ? currentOffsetX : offsetX;
            do {
                i += animate ? step : 0;

                diagramEngine.getModel().setOffsetX(+ i);
                diagramEngine.getModel().setGridSize(50);

                // update diagram
                diagramEngine.setModel(diagramModel);
                diagramEngine.repaintCanvas();
                // Sleep for 500 milliseconds
                await new Promise(resolve => setTimeout(resolve, 1));
            } while (!(i > offsetX - 1 && i < offsetX + 1));
        }
    }

    function removeOverlay(diagramEngine: DiagramEngine) {
        // remove preloader overlay layer
        const overlayLayer = diagramEngine
            .getModel()
            .getLayers()
            .find((layer) => layer instanceof OverlayLayerModel);
        if (overlayLayer) {
            diagramEngine.getModel().removeLayer(overlayLayer);
        }
        diagramEngine.repaintCanvas();
    }
}
