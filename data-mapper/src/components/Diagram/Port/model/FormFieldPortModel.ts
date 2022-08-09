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
import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { DataMapperLinkModel } from "../../Link";
import { createSpecificFieldSource } from "../../utils/dm-utils";

import { DataMapperNodeModelGenerics } from "./DataMapperPortModel";

export const FORM_FIELD_PORT = "form-field-port";

export class FormFieldPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {

	constructor(
		public field: FormField,
		public portType: "IN" | "OUT",
		public parentId: string,
		public parentFieldAccess?: string,
		public parentModel?: FormFieldPortModel) {
		super({
			type: FORM_FIELD_PORT,
			name: `${parentId}.${field.name}.${portType}`,
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

	canLinkToPort(port: FormFieldPortModel): boolean {
		return this.portType !== port.portType;
	}
}
