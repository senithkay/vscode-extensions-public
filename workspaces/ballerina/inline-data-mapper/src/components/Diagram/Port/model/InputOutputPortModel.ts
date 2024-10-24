/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { IDMType, InputType, OutputType } from "@wso2-enterprise/ballerina-core";

import { DataMapperLinkModel } from "../../Link";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { IntermediatePortModel } from "../IntermediatePort";
import { DataMapperNodeModel } from "../../Node/commons/DataMapperNode";
import { buildInputAccessExpr, createSourceForMapping, modifySourceForMultipleMappings } from "../../utils/modification-utils";

export interface InputOutputPortModelGenerics {
	PORT: InputOutputPortModel;
}

export const INPUT_OUTPUT_PORT = "input-output-port";

enum ValueType {
	Default,
	Empty,
	NonEmpty
}

export class InputOutputPortModel extends PortModel<PortModelGenerics & InputOutputPortModelGenerics> {

	public linkedPorts: PortModel[];

	constructor(
		public field: InputType | OutputType,
		public portName: string,
		public portType: "IN" | "OUT",
		public parentId: string,
		public index?: number,
		public fieldFQN?: string, // Field FQN with optional included, ie. person?.name?.firstName
		public optionalOmittedFieldFQN?: string, // Field FQN without optional, ie. person.name.firstName
		public parentModel?: InputOutputPortModel,
		public collapsed?: boolean,
		public hidden?: boolean,
		public descendantHasValue?: boolean,
		public ancestorHasValue?: boolean,
		public isWithinMapFunction?: boolean,
	) {
		super({
			type: INPUT_OUTPUT_PORT,
			name: `${portName}.${portType}`
		});
		this.linkedPorts = [];
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			targetPortChanged: (async () => {
				const sourcePort = lm.getSourcePort();
				const targetPort = lm.getTargetPort();
				// const targetPortHasLinks = Object.values(targetPort.links)
				// 	?.some(link => (link as DataMapperLinkModel)?.isActualLink);
				const targetPortHasLinks = false;

				const targetNode = targetPort.getNode() as DataMapperNodeModel;
				const valueType = this.getValueType(lm);

				if (valueType === ValueType.Default || (valueType === ValueType.NonEmpty && !targetPortHasLinks)) {
					const sourceField = sourcePort && sourcePort instanceof InputOutputPortModel && sourcePort.fieldFQN;
					const sourceInputAccessExpr = buildInputAccessExpr(sourceField);
					
					if (targetPort) {
						const typeWithValue = (targetPort as InputOutputPortModel).field;
						const expr = (typeWithValue as OutputType).mapping.expression;

						let updatedExpr;
						// if (Node.isPropertyAssignment(expr)) {
						// 	updatedExpr = expr.setInitializer(sourceInputAccessExpr);
						// } else {
							// updatedExpr = expr.replaceWithText(sourceInputAccessExpr);
						// }

						// await targetNode.context.applyModifications(updatedExpr.getSourceFile().getFullText());
					}
				} else if (targetPortHasLinks) {
					await modifySourceForMultipleMappings(lm);
				} else {
					createSourceForMapping(lm);
				}
			})
		});
		// return lm;
		return undefined;
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

	canLinkToPort(port: InputOutputPortModel): boolean {
		let isLinkExists = false;
		if (port.portType === "IN") {
			isLinkExists = this.linkedPorts.some((linkedPort) => {
				return port.getID() === linkedPort.getID()
			})
		}
		return this.portType !== port.portType && !isLinkExists
				&& ((port instanceof IntermediatePortModel) || (!port.isDisabled()));
	}

	getValueType(lm: DataMapperLinkModel): ValueType {
		const field = (lm.getTargetPort() as InputOutputPortModel).field as OutputType;

		if (field.mapping) {
			let expr = field.mapping?.expression;
	
			// if (Node.isPropertyAssignment(expr)) {
			// 	expr = expr.getInitializer();
			// }
			if (expr !== undefined) {
				// return isDefaultValue(typeWithValue.type, value) ? ValueType.Default : ValueType.NonEmpty;
			}
		}

		return ValueType.Empty;
	}
}
