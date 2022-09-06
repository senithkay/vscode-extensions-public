/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { LinkModel, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { RecordField, SpecificField } from "@wso2-enterprise/syntax-tree";

import { DataMapperLinkModel } from "../../Link";
import { createSpecificFieldSource, modifySpecificFieldSource } from "../../utils/dm-utils";

export interface STNodeModelGenerics {
	PORT: SpecificFieldPortModel;
}

export const ST_NODE_PORT = "st-node-port";

export class SpecificFieldPortModel extends PortModel<PortModelGenerics & STNodeModelGenerics> {

	constructor(
		public field: RecordField | SpecificField,
		public portType: "IN" | "OUT",
		public parentId: string,
		public parentFieldAccess?: string,
		public parentModel?: SpecificFieldPortModel) {
		super({
			type: ST_NODE_PORT,
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
					(await modifySpecificFieldSource(lm));
				}			
			}
		});
		return lm;
	}

	canLinkToPort(port: SpecificFieldPortModel): boolean {
		return this.portType !== port.portType;
	}
}
