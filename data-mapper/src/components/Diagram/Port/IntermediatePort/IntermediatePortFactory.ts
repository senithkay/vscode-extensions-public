import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { IntermediatePortModel, INT_PORT_TYPE_ID } from './IntermediatePortModel';
import { RecordField, RecordTypeDesc } from '@wso2-enterprise/syntax-tree';
import { container, injectable, singleton } from 'tsyringe';

@injectable()
@singleton()
export class IntermediatePortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(INT_PORT_TYPE_ID);
	}

	generateModel(event: { initialConfig: { typeNode: RecordField | RecordTypeDesc; type: "IN" | "OUT"; parentModel: IntermediatePortModel; }; }): PortModel {
		return undefined;
	}
}
container.register("PortFactory", {useClass: IntermediatePortFactory});
