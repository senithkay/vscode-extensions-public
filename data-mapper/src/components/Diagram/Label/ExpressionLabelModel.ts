import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { LabelModel } from '@projectstorm/react-diagrams';
import { SpecificField, STNode } from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';
import { DataMapperLinkModel } from '../Link';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
	valueNode?: STNode;
	context?: IDataMapperContext;
	link?: DataMapperLinkModel;
	specificField?: SpecificField;	
}

export class ExpressionLabelModel extends LabelModel {
	value: string;
	valueNode: STNode;
	context: IDataMapperContext;
	link?: DataMapperLinkModel;
	specificField?: SpecificField;

	constructor(options: ExpressionLabelOptions = {}) {
		super({
			...options,
			type: 'expression-label'
		});
		this.value = options.value || '';
		this.valueNode = options.valueNode;
		this.context = options.context;
		this.link = options.link;
		this.specificField = options.specificField;
		this.updateSource = this.updateSource.bind(this);
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

	async updateSource() {
		const modifications = [
			{
				type: "INSERT",
				config: {
					"STATEMENT": this.value,
				},
				endColumn: this.valueNode.position.endColumn,
				endLine: this.valueNode.position.endLine,
				startColumn: this.valueNode.position.startColumn,
				startLine: this.valueNode.position.startLine
			}
		];
		this.context.applyModifications(modifications);
	}
}
