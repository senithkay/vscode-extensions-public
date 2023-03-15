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
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { createSourceForMapping, isDefaultValue, modifySpecificFieldSource, replaceSpecificFieldValue } from "../../utils/dm-utils";
import { IntermediatePortModel } from "../IntermediatePort";

export interface RecordFieldNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export const FORM_FIELD_PORT = "form-field-port";

export class RecordFieldPortModel extends PortModel<PortModelGenerics & RecordFieldNodeModelGenerics> {

	public linkedPorts: PortModel[];

	constructor(
		public field: Type,
		public portName: string,
		public portType: "IN" | "OUT",
		public parentId: string,
		public index?: number,
		public editableRecordField?: EditableRecordField,
		public fieldFQN?: string,
		public parentModel?: RecordFieldPortModel,
		public collapsed?: boolean,
		public hidden?: boolean,
		public isWithinSelectClause?: boolean,
		public descendantHasValue?: boolean,
		public ancestorHasValue?: boolean) {
		super({
			type: FORM_FIELD_PORT,
			name: `${portName}.${portType}`
		});
		this.linkedPorts = [];
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			targetPortChanged: (async () => {
				const targetPortHasLinks = Object.values(lm.getTargetPort().links)?.some(link => (link as DataMapperLinkModel)?.isActualLink);
				const editableRecordField = (lm.getTargetPort() as RecordFieldPortModel).editableRecordField
				let isSpecificFieldWithDefaultVal = false;
				if (editableRecordField.value && STKindChecker.isSpecificField(editableRecordField.value)) {
					const targetPortValue = editableRecordField?.value?.valueExpr?.source;
					isSpecificFieldWithDefaultVal = isDefaultValue(editableRecordField.type, targetPortValue)
				}
				if (isSpecificFieldWithDefaultVal) {
					// Replace existing default value with new field
					replaceSpecificFieldValue(lm)
				} else if (targetPortHasLinks) {
					// Append to existing value if there is already a value via link or a non default value
					modifySpecificFieldSource(lm);
				} else {
					lm.addLabel(await createSourceForMapping(lm));
				}
			})
		});
		return lm;
	}

	addLink(link: LinkModel<LinkModelGenerics>): void {
		if (this.portType === 'IN'){
			this.parentModel?.setDescendantHasValue();
		}
		super.addLink(link);
	}

	addLinkedPort(port: PortModel): void{
		this.linkedPorts.push(port);
	}

	setDescendantHasValue(): void {
		this.descendantHasValue = true;
		if (this.parentModel){
			this.parentModel.setDescendantHasValue();
		}
	}

	isDisabled(): boolean {
		return this.ancestorHasValue || this.descendantHasValue
	}

	canLinkToPort(port: RecordFieldPortModel): boolean {
		let isLinkExists = false;
		if (port.portType === "IN") {
			isLinkExists = this.linkedPorts.some((linkedPort) => {
				return port.getID() === linkedPort.getID()
			})
		}
		return this.portType !== port.portType && !isLinkExists
				&& ((port instanceof IntermediatePortModel) || (!port.isDisabled()));
	}
}
