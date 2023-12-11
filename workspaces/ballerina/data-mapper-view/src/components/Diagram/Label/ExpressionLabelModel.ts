import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { LabelModel } from '@projectstorm/react-diagrams';
import { NodePosition, STNode } from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';
import { DataMapperLinkModel } from '../Link';
import { applyModifications } from '../utils/ls-utils';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
	valueNode?: STNode;
	context?: IDataMapperContext;
	link?: DataMapperLinkModel;
	field?: STNode;
	editorLabel?: string;
	deleteLink?: () => void;
}

export class ExpressionLabelModel extends LabelModel {
	value?: string;
	valueNode?: STNode;
	context: IDataMapperContext;
	link?: DataMapperLinkModel;
	field?: STNode;
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
		const valueNodePosition = this.valueNode.position as NodePosition;
		const modifications = [
			{
				type: "INSERT",
				config: {
					"STATEMENT": this.value,
				},
				endColumn: valueNodePosition.endColumn,
				endLine: valueNodePosition.endLine,
				startColumn: valueNodePosition.startColumn,
				startLine: valueNodePosition.startLine
			}
		];
		void applyModifications(this.context.filePath, modifications, this.context.visualizerContext.ballerinaRpcClient);
	}
}
