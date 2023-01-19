// tslint:disable: no-implicit-dependencies jsx-no-multiline-js
import React, { useEffect, useRef, useState } from "react";

import { CanvasWidget } from "@projectstorm/react-canvas-core";
import createEngine, { DagreEngine, DefaultNodeModel, DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";

import { createGraphqlDiagramEngine } from "../utils/engine-util";

import { CanvasWidgetContainer } from "./CanvasWidgetContainer";
import { useDiagramStyles } from "./styles/styles";

interface DiagramCanvasProps {
    model: DiagramModel;
}

const dagreEngine = new DagreEngine({
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


export function GraphqlDiagramCanvasWidget(props: DiagramCanvasProps) {
    let { model } = props;

    const [diagramEngine] = useState<DiagramEngine>(createGraphqlDiagramEngine);
    const diagramRef = useRef<HTMLDivElement>(null);
    const [diagramModel, setDiagramModel] = useState<DiagramModel>(undefined);

    const styleClass = useDiagramStyles();

    useEffect(() => {
                diagramEngine.setModel(model);
                setDiagramModel(model);

    }, [model]);


    return(
        <>
            {diagramModel && diagramEngine && diagramEngine.getModel() &&
            // tslint:disable-next-line:jsx-wrap-multiline
                <CanvasWidgetContainer>
                        <CanvasWidget engine={diagramEngine}/>
                </CanvasWidgetContainer>
            }
        </>
    );
}
