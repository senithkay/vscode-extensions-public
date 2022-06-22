import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DataMapperPortModel } from './DataMapperPortModel';

export class DataMapperPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super('datamapper');
	}

	generateModel(event: { initialConfig: { id: string }; }): PortModel {
		return new DataMapperPortModel(event.initialConfig.id);
	}
}
