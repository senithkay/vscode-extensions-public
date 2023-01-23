// tslint:disable: no-implicit-dependencies
import React from "react";

import { AbstractReactFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine } from "@projectstorm/react-diagrams-core";

import { RecordNodeModel, RECORD_NODE } from "./RecordNodeModel";
import { RecordNodeWidget } from "./RecordNodeWidget";

interface GenerateReactWidgetProps {
    model: RecordNodeModel;
}

export class RecordNodeFactory extends AbstractReactFactory<RecordNodeModel, DiagramEngine> {
    constructor() {
        super(RECORD_NODE);
    }

    generateReactWidget(event: GenerateReactWidgetProps): JSX.Element {
        return <RecordNodeWidget engine={this.engine} node={event.model} />;
    }

    generateModel(event: { initialConfig: any }) {
        return new RecordNodeModel(event.initialConfig.model);
    }
}
