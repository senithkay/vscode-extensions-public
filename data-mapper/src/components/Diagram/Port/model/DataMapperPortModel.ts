import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';
import { RecordField, SpecificField } from '@wso2-enterprise/syntax-tree';

import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';
import { createSpecificFieldSource, modifySpecificFieldSource } from '../../utils';
export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
}
export const PORT_TYPE_ID = "datamapper-port";

export class DataMapperPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {

	constructor(
		public field: RecordField | SpecificField,
		public portType: "IN" | "OUT",
		public parentId: string,
		public parentFieldAccess?: string,
		public parentModel?: DataMapperPortModel) {
		super({
			type: PORT_TYPE_ID,
			name: `${parentId}.${field.fieldName.value}.${portType}`,
		});
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: (evt) => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: async (evt) => {
				if (Object.keys(lm.getTargetPort().links).length === 1){
					lm.addLabel(await createSpecificFieldSource(lm));
				} else {
					await modifySpecificFieldSource(lm);
				}
			}
		});
		return lm;
	}

	canLinkToPort(port: DataMapperPortModel): boolean {
		return this.portType !== port.portType;
	}
}

