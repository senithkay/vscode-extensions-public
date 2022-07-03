import { LabelModel } from '@projectstorm/react-diagrams';
import { BaseModelOptions, DeserializeEvent } from '@projectstorm/react-canvas-core';
import { STNode } from '@wso2-enterprise/syntax-tree';
import { IDataMapperContext } from '../../../utils/DataMapperContext/DataMapperContext';

export interface ExpressionLabelOptions extends BaseModelOptions {
	value?: string;
	valueNode?: STNode;
	context?: IDataMapperContext;
}

export class ExpressionLabelModel extends LabelModel {
	value: string;
	valueNode: STNode;
	context: IDataMapperContext;

	constructor(options: ExpressionLabelOptions = {}) {
		super({
			...options,
			type: 'expression-label'
		});
		this.value = options.value || '';
		this.valueNode = options.valueNode;
		this.context = options.context;
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
		const langClient = await this.context.getLangClient();
		const stModifyResp = await langClient.stModify({
			documentIdentifier: {
				uri: `file://${this.context.filePath}`
			},
			astModifications: [
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
			]
		});
		this.context.updateFileContent(this.context.filePath, stModifyResp.source);
	}
}
