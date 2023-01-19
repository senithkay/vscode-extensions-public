// tslint:disable: no-implicit-dependencies jsx-no-multiline-js
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { GraphqlServiceNodeModel, GRAPHQL_SERVICE_NODE } from "./GraphqlServiceNodeModel";
import { GraphqlServiceNodeWidget } from "./GraphqlServiceNodeWidget";

interface GenerateReactWidgetProps {
    model: GraphqlServiceNodeModel;
}

export class GraphqlServiceNodeFactory extends AbstractReactFactory<GraphqlServiceNodeModel, DiagramEngine> {
    constructor() {
        super(GRAPHQL_SERVICE_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <GraphqlServiceNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new GraphqlServiceNodeModel(event.initialConfig.model);
    }
}
