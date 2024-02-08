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
import { CanvasWidget } from "@projectstorm/react-canvas-core";
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
import { Button, SidePanel, SidePanelTitleContainer } from '@wso2-enterprise/ui-toolkit'
import SidePanelList from './sidePanel';
import { Range } from '@wso2-enterprise/mi-syntax-tree/lib/src';

export interface DiagramProps {
    model: APIResource | Sequence;
    documentUri: string;
}

export function Diagram(props: DiagramProps) {
    const { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);
    const [isSidePanelOpen, setSidePanelOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [sidePanelnodeRange, setSidePanelNodeRange] = useState<Range>();
    const [sidePanelMediator, setSidePanelMediator] = useState<string>();
    const [sidePanelFormValues, setSidePanelFormValues] = useState<{ [key: string]: any }>();
    const [sidePanelShowBackBtn, setSidePanelShowBackBtn] = useState<boolean>(false);
    const [sidePanelBackBtn, setSidePanelBackBtn] = useState<number>(0);
    const [diagramWidth, setDiagramWidth] = useState<number>(0);

    useEffect(() => {
        if (diagramEngine) {
            const { nodes, links } = getNodes();
            drawDiagram(nodes as any, links);
        }
    }, [props.model, props.documentUri]);

    useEffect(() => {
        setTimeout(() => {
            if (diagramModel) {
                window.addEventListener("resize", () => {
                    centerDiagram();
                });
                centerDiagram();
            }
        }, 500);
    }, [diagramModel]);

    const getNodes = () => {
        // run sizing visitor
        const sizingVisitor = new SizingVisitor();
        traversNode(model, sizingVisitor);
        const diagramWidth = sizingVisitor.getSequenceWidth();
        setDiagramWidth(diagramWidth);

        // run position visitor
        const positionVisitor = new PositionVisitor(diagramWidth);
        traversNode(model, positionVisitor);

        // run node visitor
        const nodeVisitor = new NodeFactoryVisitor();
        traversNode(model, nodeVisitor);
        const nodes = nodeVisitor.getNodes();
        const links = nodeVisitor.getLinks();
        return { nodes, links };
    };

    const drawDiagram = (nodes: MediatorNodeModel[], links: NodeLinkModel[]) => {
        const newDiagramModel = new DiagramModel();
        newDiagramModel.addAll(...nodes, ...links);

        diagramEngine.setModel(newDiagramModel);
        setDiagramModel(newDiagramModel);
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
            {diagramEngine && diagramModel && (
                <div>
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
                        {isSidePanelOpen && <SidePanel
                            isOpen={isSidePanelOpen}
                            alignmanet="right"
                            width={450}
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
                        <DiagramCanvas>
                            <CanvasWidget engine={diagramEngine} />
                        </DiagramCanvas>
                    </SidePanelProvider>
                </div >
            )}
        </>
    );

    function centerDiagram() {
        if (diagramEngine?.getCanvas()?.getBoundingClientRect()) {
            const canvasBounds = diagramEngine.getCanvas().getBoundingClientRect();

            const offsetX = canvasBounds.width / 2;

            diagramEngine.getModel().setOffsetX(offsetX - (diagramWidth / 2));
        }

        // update diagram
        diagramEngine.setModel(diagramModel);
        diagramEngine.repaintCanvas();
    }
}
