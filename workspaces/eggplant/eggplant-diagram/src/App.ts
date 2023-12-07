/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import createEngine, { DiagramEngine, DiagramModel } from "@projectstorm/react-diagrams";
import { DefaultLabelFactory, DefaultLinkFactory, DefaultNodeFactory, DefaultNodeModel, DefaultPortFactory } from "./components/default";
import { Colors } from "./resources";

//TODO: Update this to get BE model and generate diagram

export class App {
    protected activeModel: DiagramModel;
    protected diagramEngine: DiagramEngine;

    constructor() {
        this.diagramEngine = createEngine();
        // register default factories
        this.diagramEngine.getNodeFactories().registerFactory(new DefaultNodeFactory());
        this.diagramEngine.getPortFactories().registerFactory(new DefaultPortFactory());
        this.diagramEngine.getLinkFactories().registerFactory(new DefaultLinkFactory());
        this.diagramEngine.getLabelFactories().registerFactory(new DefaultLabelFactory());
        this.newModel();
    }

    // TODO: Update this use BE model and generate diagram
    public newModel() {
        this.activeModel = new DiagramModel();
        this.diagramEngine.setModel(this.activeModel);

		// add sample nodes
        var node1 = new DefaultNodeModel("Start", Colors.PRIMARY_CONTAINER);
        let port = node1.addOutPort("Out");
        node1.setPosition(100, 100);

        var node2 = new DefaultNodeModel("Action", Colors.PRIMARY_CONTAINER);
        let port2 = node2.addInPort("In");
        node2.addOutPort("Out1");
        node2.setPosition(300, 100);

        // link the ports
        let link1 = port.link(port2);

        this.activeModel.addAll(node1, node2, link1);
    }

    public getActiveDiagram(): DiagramModel {
        return this.activeModel;
    }

    public getDiagramEngine(): DiagramEngine {
        return this.diagramEngine;
    }
}
