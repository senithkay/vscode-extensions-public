// tslint:disable: no-implicit-dependencies
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { ServiceClassNodeModel, SERVICE_CLASS_NODE } from "./ServiceClassNodeModel";
import { ServiceClassNodeWidget } from "./ServiceClassWidget";

interface GenerateReactWidgetProps {
    model: ServiceClassNodeModel;
}

export class ServiceClassNodeFactory extends AbstractReactFactory<ServiceClassNodeModel, DiagramEngine> {
    constructor() {
        super(SERVICE_CLASS_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <ServiceClassNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new ServiceClassNodeModel(event.initialConfig.model);
    }
}
