/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { DMType } from "@wso2-enterprise/mi-core";
import { isPropertyAssignment } from "typescript";

import { DataMapperLinkModel } from "../../Link";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { IntermediatePortModel } from "../IntermediatePort";

export interface RecordFieldNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export const FORM_FIELD_PORT = "form-field-port";

export class RecordFieldPortModel extends PortModel<PortModelGenerics & RecordFieldNodeModelGenerics> {

	public linkedPorts: PortModel[];

	constructor(
		public field: DMType,
		public portName: string,
		public portType: "IN" | "OUT",
		public parentId: string,
		public index?: number,
		public editableRecordField?: DMTypeWithValue,
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
			sourcePortChanged: () => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (async () => {
				const targetPortHasLinks = Object.values(lm.getTargetPort().links)
					?.some(link => (link as DataMapperLinkModel)?.isActualLink);
				const hasDefaultValue = this.isContainDefaultValue(lm);

				if (hasDefaultValue) {
					// replaceSpecificFieldValue(lm);
				} else if (targetPortHasLinks) {
					// modifySpecificFieldSource(lm);
				} else {
					// lm.addLabel(await createSourceForMapping(lm));
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

	isContainDefaultValue(lm: DataMapperLinkModel): boolean {
		const editableRecordField = (lm.getTargetPort() as RecordFieldPortModel).editableRecordField;

		if (editableRecordField?.value) {
			let expr = editableRecordField.value;
			if (isPropertyAssignment(expr)) {
				expr = expr.initializer;
			}
		}

		return false;
	}
}
