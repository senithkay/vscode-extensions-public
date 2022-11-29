import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { INT_PORT_TYPE_ID } from './IntermediatePortModel';
import { container, injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class IntermediatePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(INT_PORT_TYPE_ID);
	}

	generateModel(): PortModel {
		return undefined;
	}
}
container.register("PortFactory", {useClass: IntermediatePortFactory});
