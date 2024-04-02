import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';

import { INT_PORT_TYPE_ID } from './IntermediatePortModel';

export class IntermediatePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(INT_PORT_TYPE_ID);
	}

	generateModel(): PortModel {
		return undefined;
	}
}
