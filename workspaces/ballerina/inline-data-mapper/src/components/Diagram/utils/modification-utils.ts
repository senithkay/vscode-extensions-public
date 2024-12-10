/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IDMModel, Mapping } from "@wso2-enterprise/ballerina-core";
import { DataMapperLinkModel } from "../Link";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputOutputPortModel } from "../Port";
import { IDataMapperContext } from "src/utils/DataMapperContext/DataMapperContext";
import { MappingFindingVisitor } from "../../../visitors/MappingFindingVisitor";
import { traverseNode } from "../../../utils/model-utils";

export async function createNewMapping(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	const outputPortModel = targetPort as InputOutputPortModel;
	const targetNode = outputPortModel.getNode() as DataMapperNodeModel;
	const { mappings } = targetNode.context.model;
	const input = (link.getSourcePort() as InputOutputPortModel).optionalOmittedFieldFQN;
	const outputPortParts = outputPortModel.portName.split('.');
	const isWithinArray = outputPortParts.some(part => !isNaN(Number(part)));

	if (isWithinArray) {
		createNewMappingWithinArray(outputPortParts.slice(1), input, targetNode.context.model);
		const updatedMappings = mappings;
		return await targetNode.context.applyModifications(updatedMappings);
	} else {
		const newMapping = {
			output: outputPortParts.slice(1).join('.'),
			inputs: [input],
			expression: input
		};
	
		mappings.push(newMapping);
	}

	return await targetNode.context.applyModifications(mappings);
}

export async function updateExistingMapping(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	const outputPortModel = targetPort as InputOutputPortModel;
	const targetNode = outputPortModel.getNode() as DataMapperNodeModel;
	const { model } = targetNode.context;
	const input = (link.getSourcePort() as InputOutputPortModel).optionalOmittedFieldFQN;
	const outputPortParts = outputPortModel.portName.split('.');
	const targetId = outputPortParts.slice(1).join('.');

	const mappingFindingVisitor = new MappingFindingVisitor(targetId);
	traverseNode(model, mappingFindingVisitor);
	const targetMapping = mappingFindingVisitor.getTargetMapping();

	if (targetMapping) {
		targetMapping.inputs.push(input);
		targetMapping.expression = `${targetMapping.expression} + ${input}`;
	}

	return await targetNode.context.applyModifications(model.mappings);
}

export async function addValue(fieldId: string, value: string, context: IDataMapperContext) {
	const { mappings } = context.model;

	const newMapping = {
		output: fieldId,
		inputs: [value],
		expression: value
	};

	mappings.push(newMapping);

	return await context.applyModifications(mappings);
}

export function buildInputAccessExpr(fieldFqn: string): string {
    // Regular expression to match either quoted strings or non-quoted strings with dots
    const regex = /"([^"]+)"|'([^"]+)'|([^".]+)/g;

    const result = fieldFqn.replace(regex, (match, doubleQuoted, singleQuoted, unquoted) => {
        if (doubleQuoted) { 
            return `["${doubleQuoted}"]`; // If the part is enclosed in double quotes, wrap it in square brackets
        } else if (singleQuoted) {
			return `['${singleQuoted}']`; // If the part is enclosed in single quotes, wrap it in square brackets
		} else {
            return unquoted; // Otherwise, leave the part unchanged
        }
    });

	return result.replace(/(?<!\?)\.\[/g, '['); // Replace occurrences of '.[' with '[' to handle consecutive bracketing
}

function createNewMappingWithinArray(outputPortParts: string[], input: string, model: IDMModel) {
	for(let i = outputPortParts.length; i >= 1; i--) {
		const targetId = outputPortParts.slice(0, i).join('.');

		const mappingFindingVisitor = new MappingFindingVisitor(targetId);
        traverseNode(model, mappingFindingVisitor);
        const targetMapping = mappingFindingVisitor.getTargetMapping();

		if (targetMapping) {
			const arrayIndex = Number(outputPortParts[i]);
			const arrayElement = targetMapping.elements.length > 0 ? targetMapping.elements[arrayIndex] : undefined;

			if (arrayElement) {
				arrayElement.mappings.push({
					output: outputPortParts.join('.'),
					inputs: [input],
					expression: input,
					elements: []
				});
			} else {
				const newMapping: Mapping = {
					output: targetId,
					inputs: [input],
					expression: input,
					elements: []
				};
				targetMapping.elements.push({
					mappings: [newMapping]
				});
			}
			break;
		}
	}
}
