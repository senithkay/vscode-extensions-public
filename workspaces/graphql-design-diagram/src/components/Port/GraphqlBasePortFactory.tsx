// tslint:disable: no-implicit-dependencies jsx-no-multiline-js
import { AbstractModelFactory } from "@projectstorm/react-canvas-core";
import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";

import { GraphqlNodeBasePort } from "./GraphqlNodeBasePort";

export class GraphqlBasePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {
    constructor(modelType: string) {
        super(modelType);
    }

    generateModel(event: { initialConfig: any }): GraphqlNodeBasePort {
        return new GraphqlNodeBasePort(event.initialConfig.id, event.initialConfig.portType);
    }
}
