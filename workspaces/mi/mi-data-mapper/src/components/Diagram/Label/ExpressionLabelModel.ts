import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { LabelModel } from '@projectstorm/react-diagrams';
import { Node } from "typescript";

import { IDataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';
import { DataMapperLinkModel } from '../Link';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
	valueNode?: Node;
	context?: IDataMapperContext;
	link?: DataMapperLinkModel;
	field?: Node;
	editorLabel?: string;
	deleteLink?: () => void;
}

export class ExpressionLabelModel extends LabelModel {
	value?: string;
	valueNode?: Node;
	context: IDataMapperContext;
	link?: DataMapperLinkModel;
	field?: Node;
	editorLabel?: string;
	deleteLink?: () => void;

	constructor(options: ExpressionLabelOptions = {}) {
		super({
			...options,
			type: 'expression-label'
		});
		this.value = options.value || '';
		this.valueNode = options.valueNode;
		this.context = options.context;
		this.link = options.link;
		this.field = options.field;
		this.editorLabel = options.editorLabel;
		this.updateSource = this.updateSource.bind(this);
		this.deleteLink = options.deleteLink;
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

	updateSource(): void {
		// TODO: Implement update source logic
	}
}
