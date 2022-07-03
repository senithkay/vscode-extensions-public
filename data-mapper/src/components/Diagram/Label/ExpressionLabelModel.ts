import { LabelModel } from '@projectstorm/react-diagrams';
import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
}

export class ExpressionLabelModel extends LabelModel {
	value: string;

	constructor(options: ExpressionLabelOptions = {}) {
		super({
			...options,
			type: 'expression-label'
		});
		this.value = options.value || '';
	}

	serialize() {
		return {
			...super.serialize(),
			value: this.value
		};
	}

	deserialize(event: DeserializeEvent<this>): void {
		super.deserialize(event);
		this.value = event.data.value;
	}
}
