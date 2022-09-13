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
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { createSourceForMapping, getBalRecFieldName, modifySpecificFieldSource } from "../../utils/dm-utils";

export interface RecordFieldNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export const FORM_FIELD_PORT = "form-field-port";

export class RecordFieldPortModel extends PortModel<PortModelGenerics & RecordFieldNodeModelGenerics> {

	constructor(
		public field: Type,
		public portType: "IN" | "OUT",
		public parentId: string,
		public index?: number,
		public editableRecordField?: EditableRecordField,
		public parentFieldAccess?: string,
		public parentModel?: RecordFieldPortModel) {
		super({
			type: FORM_FIELD_PORT,
			name: `${parentId}.${getBalRecFieldName(field.name)}.${portType}`,
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
					lm.addLabel(await createSourceForMapping(lm));
				} else {
					await modifySpecificFieldSource(lm);
				}
			}
		});
		return lm;
	}

	canLinkToPort(port: RecordFieldPortModel): boolean {
		return this.portType !== port.portType;
	}
}
