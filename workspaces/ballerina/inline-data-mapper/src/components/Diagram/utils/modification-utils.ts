/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { PortModel } from "@projectstorm/react-diagrams-core";
import { DataMapperLinkModel } from "../Link";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { InputOutputPortModel } from "../Port";

export async function createSourceForMapping(link: DataMapperLinkModel) {
    
}

export async function getUpdatedMappings(link: DataMapperLinkModel) {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	const outputPortModel = targetPort as InputOutputPortModel;
	const targetNode = outputPortModel.getNode() as DataMapperNodeModel;
	const mappings = targetNode.context.model.mappings;
	const input = (link.getSourcePort() as InputOutputPortModel).optionalOmittedFieldFQN;

	console.log("==updatedMappings before", mappings);

	const updatedMappings = mappings.map(mapping => {
		if (mapping.output === outputPortModel.optionalOmittedFieldFQN) {
			return {
				...mapping,
				inputs: [...mapping.inputs, input],
				expression: mapping.expression + ' + ' + input
			};
		}
		return mapping;
	});

	return updatedMappings;
}

export async function updateExistingValue(sourcePort: PortModel, targetPort: PortModel, newValue?: string, suffix: string = '') {
	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const mappings = targetNode.context.model.mappings;

	const existingMapping = mappings.find(mapping => mapping.output === targetPort.getID());
	if (!existingMapping) {
		return;
	}

	existingMapping.inputs = [newValue || buildInputAccessExpr(sourcePort.getID()) + suffix];

	console.log("==existingMapping", existingMapping);


	// const sourceField = sourcePort && sourcePort instanceof InputOutputPortModel && sourcePort.fieldFQN;
	// const sourceInputAccessExpr = (newValue || buildInputAccessExpr(sourceField)) + suffix;
	// const expr = (targetPort as InputOutputPortModel).value;

	// let updatedExpr;
	// if (Node.isPropertyAssignment(expr)) {
	// 	updatedExpr = expr.setInitializer(sourceInputAccessExpr);
	// } else {
	// 	updatedExpr = expr.replaceWithText(sourceInputAccessExpr);
	// }

	// await targetNode.context.applyModifications(updatedExpr.getSourceFile().getFullText());
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
