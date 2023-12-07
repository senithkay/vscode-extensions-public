import { DiagramEngine, PortModel } from "@projectstorm/react-diagrams";
import { WorkerPortModel } from "./WorkerPortModel";
import { AbstractModelFactory } from "@projectstorm/react-canvas-core";

export class WorkerPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {
    constructor() {
        super('workerPort');
    }

    generateModel(event: { initialConfig: any }): WorkerPortModel {
        return new WorkerPortModel(event.initialConfig.id, event.initialConfig.portType);
    }
}
