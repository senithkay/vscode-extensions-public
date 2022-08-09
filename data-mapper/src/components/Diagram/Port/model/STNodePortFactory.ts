import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { container, injectable, singleton } from 'tsyringe';

import { ST_NODE_PORT } from "./STNodePortModel";

@injectable()
@singleton()
export class STNodePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(ST_NODE_PORT);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("PortFactory", {useClass: STNodePortFactory});
