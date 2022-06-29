import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';
import { RecordField, RecordTypeDesc } from '@wso2-enterprise/syntax-tree';

import md5 from "blueimp-md5";

import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';
import { createSpecificFieldSource } from '../../utils';
export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
}
export const PORT_TYPE_ID = "datamapper-port";

export class DataMapperPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {

	constructor(
		public typeNode: RecordField | RecordTypeDesc,
		public portType: "IN" | "OUT",
		public parentModel?: DataMapperPortModel) {
		super({
			type: PORT_TYPE_ID,
			name: md5(JSON.stringify(typeNode.position) + portType),
		});
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: (evt) => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: async (evt) => {
				lm.addLabel(await createSpecificFieldSource(lm));
			}
		});
		return lm;
	}

	canLinkToPort(port: DataMapperPortModel): boolean {
		return this.portType !== port.portType;
	}
}

