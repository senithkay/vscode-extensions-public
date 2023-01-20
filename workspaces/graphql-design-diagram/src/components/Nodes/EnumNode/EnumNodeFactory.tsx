// tslint:disable: no-implicit-dependencies
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { EnumNodeModel, ENUM_NODE } from "./EnumNodeModel";
import { EnumNodeWidget } from "./EnumNodeWidget";

interface GenerateReactWidgetProps {
    model: EnumNodeModel;
}

export class EnumNodeFactory extends AbstractReactFactory<EnumNodeModel, DiagramEngine> {
    constructor() {
        super(ENUM_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <EnumNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new EnumNodeModel(event.initialConfig.model);
    }
}
