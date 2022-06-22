import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DataMapperPortModel } from './DataMapperPortModel';
import { RecordField, RecordTypeDesc } from '@wso2-enterprise/syntax-tree';

export class DataMapperPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super('datamapper');
	}

	generateModel(event: { initialConfig: { typeNode: RecordField | RecordTypeDesc; type: "IN" | "OUT"; parentModel: DataMapperPortModel; }; }): PortModel {
		return new DataMapperPortModel(event.initialConfig.typeNode, event.initialConfig.type, event.initialConfig.parentModel);
	}
}
