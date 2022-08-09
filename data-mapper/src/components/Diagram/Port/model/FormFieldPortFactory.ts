import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { DiagramEngine, PortModel } from '@projectstorm/react-diagrams';
import { container, injectable, singleton } from 'tsyringe';

import { FORM_FIELD_PORT } from "./FormFieldPortModel";

@injectable()
@singleton()
export class FormFieldPortFactory extends AbstractModelFactory<PortModel, DiagramEngine> {

	constructor() {
		super(FORM_FIELD_PORT);
	}

	generateModel(event: { initialConfig: any }): any {
		return undefined;
	}
}
container.register("PortFactory", {useClass: FormFieldPortFactory});
