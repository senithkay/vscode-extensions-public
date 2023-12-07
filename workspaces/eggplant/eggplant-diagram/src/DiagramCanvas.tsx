
import React, { useState } from "react";
import { Model } from "./types/types";

import { SidePanel } from "@wso2-enterprise/ui-toolkit";
import { EggplantDiagram } from "./Diagram";
import styled from "@emotion/styled";
import { NodePanel } from "./components/NodePanel";
import { PanelItemWidget } from "./components/PanelItem";

namespace S {
    export const Body = styled.div`
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		min-height: 100%;
	`;

    export const Header = styled.div`
		display: flex;
		background: rgb(30, 30, 30);
		flex-grow: 0;
		flex-shrink: 0;
		color: white;
		font-family: Helvetica, Arial, sans-serif;
		padding: 10px;
		align-items: center;
	`;

    export const Content = styled.div`
		display: flex;
		flex-grow: 1;
	`;

    export const Layer = styled.div`
		position: relative;
		flex-grow: 1;
	`;
}

interface DiagramCanvasProps {
    model: Model;
}




export function DiagramCanvas(props: DiagramCanvasProps) {
    const { model } = props;

    const [diagramModel, setDiagramModel] = useState<Model>(model);
    
    const updatedModel = (data: any) => {
       const model2: Model = {
            nodes: [
                { name: "A", links: [{ name: "B" }, { name: "C" }] },
                { name: "B", links: [{ name: "FunctionEnd" }] },
                { name: "C", links: [{ name: "FunctionEnd" }] },
                { name: "FunctionStart", links: [{ name: "A" }] },
                { name: "FunctionEnd", links: [] },
                { name: "D", links: [] },
            ],
        };


        setDiagramModel(model2);

    }


    return (
        <S.Body>
            <S.Content>
                <NodePanel>
                    <PanelItemWidget model={{ type: 'in' }} name="switch" />
                    <PanelItemWidget model={{ type: 'in' }} name="switch" />
                </NodePanel>
                <S.Layer
                    onDrop={(event) => {
                        var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
                    
                        updatedModel(data);

                        // this.forceUpdate();
                    }}
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}
                >
                    <EggplantDiagram model={diagramModel} />
                </S.Layer>
            </S.Content>
        </S.Body>
    );
}
