/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { TypeField } from "@wso2-enterprise/ballerina-core";
import { STKindChecker } from "@wso2-enterprise/syntax-tree";

import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import {
	createSourceForMapping,
	generateDestructuringPattern,
	getInnermostExpressionBody,
	getModificationForFromClauseBindingPattern,
	getModificationForSpecificFieldValue,
	isDefaultValue,
	modifySpecificFieldSource,
	replaceSpecificFieldValue
} from "../../utils/dm-utils";
import { IntermediatePortModel } from "../IntermediatePort";
import { DataMapperNodeModel } from "../../Node/commons/DataMapperNode";
import { QueryExprMappingType } from "../../Node";

export interface RecordFieldNodeModelGenerics {
	PORT: RecordFieldPortModel;
}

export const FORM_FIELD_PORT = "form-field-port";

export class RecordFieldPortModel extends PortModel<PortModelGenerics & RecordFieldNodeModelGenerics> {

	public linkedPorts: PortModel[];

	constructor(
		public field: TypeField,
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
			sourcePortChanged: () => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (async () => {
				const targetPort = lm.getTargetPort();
				const targetPortHasLinks = Object.values(targetPort.links)
					?.some(link => (link as DataMapperLinkModel)?.isActualLink);
				
				const { position, mappingType, stNode } = (targetPort.getNode() as DataMapperNodeModel)
					.context.selection.selectedST;
				const hasDefaultValue = this.isContainDefaultValue(lm);

				if (hasDefaultValue) {
					const modifications = [];
					const sourcePort = lm.getSourcePort();
					let sourceField = sourcePort && sourcePort instanceof RecordFieldPortModel && sourcePort.fieldFQN;
					if (mappingType === QueryExprMappingType.A2SWithCollect) {
						const fieldParts = sourceField.split('.');
						// by default, use the sum operator to aggregate the values
						sourceField = `sum(${fieldParts[fieldParts.length - 1]})`;
						const bindingPatternSrc = generateDestructuringPattern(fieldParts.slice(1).join('.'));
						modifications.push(
							getModificationForFromClauseBindingPattern(position, bindingPatternSrc, stNode)
						);
					}
					modifications.push(getModificationForSpecificFieldValue(lm, sourceField));
					replaceSpecificFieldValue(lm, modifications);
				} else if (targetPortHasLinks) {
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

	isContainDefaultValue(lm: DataMapperLinkModel): boolean {
		const editableRecordField = (lm.getTargetPort() as RecordFieldPortModel).editableRecordField;

		if (editableRecordField?.value) {
			let expr = editableRecordField.value;
			if (STKindChecker.isSpecificField(expr)) {
				expr = expr.valueExpr;
			}
			const innerExpr = getInnermostExpressionBody(expr);
			const value: string = innerExpr?.value || innerExpr?.source;
			return isDefaultValue(editableRecordField.type, value);
		}

		return false;
	}
}
