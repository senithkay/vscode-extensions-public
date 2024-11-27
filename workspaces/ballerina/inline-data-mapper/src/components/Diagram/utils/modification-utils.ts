/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DataMapperLinkModel } from "../Link";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputOutputPortModel } from "../Port";

export async function createNewMapping(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	const outputPortModel = targetPort as InputOutputPortModel;
	const targetNode = outputPortModel.getNode() as DataMapperNodeModel;
	const mappings = targetNode.context.model.mappings;
	const input = (link.getSourcePort() as InputOutputPortModel).optionalOmittedFieldFQN;

	const newMapping = {
		output: outputPortModel.portName.split('.').slice(1).join('.'),
		inputs: [input],
		expression: input
	};

	mappings.mappings.push(newMapping);

	return await targetNode.context.applyModifications(mappings.mappings);
}

export async function updateExistingMapping(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	const outputPortModel = targetPort as InputOutputPortModel;
	const targetNode = outputPortModel.getNode() as DataMapperNodeModel;
	const mappings = targetNode.context.model.mappings;
	const input = (link.getSourcePort() as InputOutputPortModel).optionalOmittedFieldFQN;

	const updatedMappings = mappings.mappings.map(mapping => {
		const portNameParts = outputPortModel.portName.split('.');
		const portId = portNameParts.slice(1).join('.');
		if (mapping.output === portId) {
			return {
				...mapping,
				inputs: [...mapping.inputs, input],
				expression: mapping.expression + ' + ' + input
			};
		}
		return mapping;
	});

	return await targetNode.context.applyModifications(updatedMappings);
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
