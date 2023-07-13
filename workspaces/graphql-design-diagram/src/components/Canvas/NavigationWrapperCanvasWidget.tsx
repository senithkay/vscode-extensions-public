import React, { useEffect } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { useGraphQlContext } from "../DiagramContext/GraphqlDiagramContext";
import { getComponentName } from "../utils/common-util";
import { focusToNode } from "../utils/engine-util";

import { CustomCanvasWidget } from "./CustomCanvasWidget";

interface NavigationWrapperCanvasProps {
    diagramEngine: DiagramEngine;
}

export function NavigationWrapperCanvasWidget(props: NavigationWrapperCanvasProps){
    const { diagramEngine } = props;
    const { selectedDiagramNode } = useGraphQlContext();
    // could add a state to get is node focused which can be passed to isNodeSelected

    useEffect(() => {
        if (selectedDiagramNode) {
            const selectedNewModel = diagramEngine.getModel().getNode(getComponentName(selectedDiagramNode));
            if (selectedNewModel) {
                focusToNode(selectedNewModel, diagramEngine.getModel().getZoomLevel(), diagramEngine);
            }
        }
    }, [selectedDiagramNode]);


    return (
        <CustomCanvasWidget engine={diagramEngine} isNodeSelected={selectedDiagramNode} />
    );
}
