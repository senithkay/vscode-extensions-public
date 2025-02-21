/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { LinkModel, LinkModelGenerics, PortModel, PortModelGenerics } from "@projectstorm/react-diagrams";
import { DMType } from "@wso2-enterprise/mi-core";

import { DataMapperLinkModel } from "../../Link";
import { DMTypeWithValue } from "../../Mappings/DMTypeWithValue";
import { IntermediatePortModel } from "../IntermediatePort";
import { getMappingType, getValueType, isPendingMappingRequired } from "../../utils/common-utils";
import {
	createSourceForMapping,
	modifySourceForMultipleMappings,
	updateExistingValue
} from "../../utils/modification-utils";

export interface InputOutputPortModelGenerics {
	PORT: InputOutputPortModel;
}

export const INPUT_OUTPUT_PORT = "input-output-port";

export enum ValueType {
	Default,
	Empty,
	NonEmpty
}

export enum MappingType {
	ArrayToArray = "array-array",
	ArrayToSingleton = "array-singleton",
	ObjectToObject = "object-object",
	Default = undefined // This is for non-array mappings currently
}

export class InputOutputPortModel extends PortModel<PortModelGenerics & InputOutputPortModelGenerics> {

	public linkedPorts: PortModel[];
	public pendingMappingType: MappingType;

	constructor(
		public field: DMType,
		public portName: string,
		public portType: "IN" | "OUT",
		public parentId: string,
		public index?: number,
		public typeWithValue?: DMTypeWithValue,
		public fieldFQN?: string, // Field FQN with optional included, ie. person?.name?.firstName
		public optionalOmittedFieldFQN?: string, // Field FQN without optional, ie. person.name.firstName
		public parentModel?: InputOutputPortModel,
		public collapsed?: boolean,
		public hidden?: boolean,
		public descendantHasValue?: boolean,
		public ancestorHasValue?: boolean,
		public isWithinMapFunction?: boolean,
		public isPreview?: boolean
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
				const sourcePort = lm.getSourcePort() as InputOutputPortModel;
				const targetPort = lm.getTargetPort() as InputOutputPortModel;
				
				const mappingType = getMappingType(sourcePort, targetPort);
				if (isPendingMappingRequired(mappingType)) {
					// Source update behavior is determined by the user when connecting arrays.
					return;
				}

				const targetPortHasLinks = Object.values(targetPort.links)
					?.some(link => (link as DataMapperLinkModel)?.isActualLink);
				const valueType = getValueType(targetPort);

				if (valueType === ValueType.Default || (valueType === ValueType.NonEmpty && !targetPortHasLinks)) {
					await updateExistingValue(sourcePort, targetPort);
				} else if (targetPortHasLinks) {
					await modifySourceForMultipleMappings(lm);
				} else {
					await createSourceForMapping(sourcePort, targetPort);
				}
			})
		});
		return lm;
	}

	addLink(link: LinkModel<LinkModelGenerics>): void {
		if (this.portType === 'IN') {
			this.parentModel?.setDescendantHasValue();
		}
		super.addLink(link);
	}

	addLinkedPort(port: PortModel): void {
		this.linkedPorts.push(port);
	}

	setPendingMappingType(mappingType: MappingType): void {
		this.pendingMappingType = mappingType;
	}

	setDescendantHasValue(): void {
		this.descendantHasValue = true;
		if (this.parentModel) {
			this.parentModel.setDescendantHasValue();
		}
	}

	isDisabled(): boolean {
		return this.isPreview || this.ancestorHasValue || this.descendantHasValue
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
}
