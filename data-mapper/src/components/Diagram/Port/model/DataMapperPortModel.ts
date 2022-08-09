import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';

import { DataMapperLinkModel } from '../../Link';
import { createSpecificFieldSource } from '../../utils/dm-utils';
export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
}

export const PORT_TYPE_ID = "form-field-port";

export class DataMapperPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {

	constructor(
		public field: string,
		public portType: "IN" | "OUT",
		public parentId: string,
		public parentFieldAccess?: string,
		public parentModel?: DataMapperPortModel) {
		super({
			type: PORT_TYPE_ID,
			name: `${parentId}.${field}.${portType}`,
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

