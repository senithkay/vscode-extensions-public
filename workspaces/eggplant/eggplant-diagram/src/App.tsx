/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState, useEffect } from "react";
import { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { DefaultNodeModel } from "./components/default";
import { Colors } from "./resources";
import { BodyWidget } from "./components/layout/BodyWidget";
import { Flow } from "./types/types";
import { generateEngine } from "./utils";
import { OverlayLayerModel } from "./components/OverlayLoader";

interface EggplantAppProps {
    flow: Flow;
}

export function EggplantApp(props: EggplantAppProps) {
    const { flow } = props;
    const [diagramEngine] = useState<DiagramEngine>(generateEngine());
    const [diagramModel, setDiagramModel] = useState<DiagramModel | null>(null);

    useEffect(() => {
        console.log("diagramEngine", diagramEngine);
        const model = new DiagramModel();
        model.addLayer(new OverlayLayerModel());
        console.log("model", model);
        diagramEngine.setModel(model);
        setDiagramModel(model);
        console.log("diagramModel", diagramModel);

        refreshDiagram();
    }, []);

    const refreshDiagram = () => {
        console.log("refreshDiagram", flow);

        var node1 = new DefaultNodeModel("Start", Colors.PRIMARY_CONTAINER);
        let port = node1.addOutPort("Out");
        node1.setPosition(100, 100);

        var node2 = new DefaultNodeModel("Action", Colors.PRIMARY_CONTAINER);
        let port2 = node2.addInPort("In");
        node2.addOutPort("Out1");
        node2.setPosition(300, 100);

        // link the ports
        let link1 = port.link(port2);

        diagramModel.addAll(node1, node2, link1);
    };

    return <div>{diagramEngine && <BodyWidget engine={diagramEngine} />}</div>;
}

export default EggplantApp;
