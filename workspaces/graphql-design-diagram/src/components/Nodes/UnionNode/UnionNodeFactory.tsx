// tslint:disable: no-implicit-dependencies
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { ServiceClassNodeWidget } from "../ServiceClassNode/ServiceClassWidget";

import { UnionNodeModel, UNION_NODE } from "./UnionNodeModel";
import { UnionNodeWidget } from "./UnionNodeWidget";

interface GenerateReactWidgetProps {
    model: UnionNodeModel;
}

export class UnionNodeFactory extends AbstractReactFactory<UnionNodeModel, DiagramEngine> {
    constructor() {
        super(UNION_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <UnionNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new UnionNodeModel(event.initialConfig.model);
    }
}
