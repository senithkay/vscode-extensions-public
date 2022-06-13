import { NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { DataMapperPortModel } from './DataMapperPortModel';

export interface DiamondNodeModelGenerics {
	PORT: DataMapperPortModel;
}

export class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DiamondNodeModelGenerics> {
	public readonly stNode: Object;
	public readonly supportOutput: boolean;
	public readonly supportInput: boolean
	constructor(stNode: Object, supportOutput: boolean, supportInput: boolean) {
		super({
			type: 'datamapper'
		});
		this.stNode = stNode;
		this.supportInput = supportInput;
		this.supportOutput = supportOutput;

		// Add ports
		Object.entries(stNode).forEach((entry: [string, any]) => {
			if (supportInput) {
				this.addPort(new DataMapperPortModel(entry[0]+"_in","IN"));
			}
			if (supportOutput) {
				this.addPort(new DataMapperPortModel(entry[0]+"_out","OUT"));
			}
		});
	}
}
