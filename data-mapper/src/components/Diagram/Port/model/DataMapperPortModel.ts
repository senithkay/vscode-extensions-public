import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';
import { RecordField, RecordTypeDesc } from '@wso2-enterprise/syntax-tree';

import md5 from "blueimp-md5";

import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';
export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
}
export class DataMapperPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {
	public readonly typeNode: RecordField | RecordTypeDesc;
	public readonly parentModel: DataMapperPortModel;
	public readonly portType: "IN" | "OUT";

	constructor(typeNode: RecordField | RecordTypeDesc, type: "IN" | "OUT", parentModel?: DataMapperPortModel) {
		super({
			type: 'datamapper',
			name: md5(JSON.stringify(typeNode.position) + type),
		});
		this.typeNode = typeNode;
		this.parentModel = parentModel;
		this.portType = type;
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: (evt) => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (evt) => {

				lm.addLabel(evt.port.getName() + " = " + lm.getSourcePort().getName());
			}
		});
		return lm;
	}
}
