/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { DMType, TypeKind } from "@wso2-enterprise/mi-core";
import { PortModel } from "@projectstorm/react-diagrams-core";
import {
	ArrayLiteralExpression,
	Block,
	InterfaceDeclaration,
	Node,
	ObjectLiteralExpression,
	PropertyAccessExpression,
	PropertyAssignment,
	ReturnStatement,
	SourceFile,
	TypeLiteralNode
} from "ts-morph";
import { lowerFirst, upperFirst } from "lodash";

import { DataMapperLinkModel } from "../Link";
import { InputOutputPortModel, IntermediatePortModel } from "../Port";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import {
	getFieldIndexes,
	getFieldNameFromOutputPort,
	getLinebreak,
	getPropertyAssignment,
	getCallExprReturnStmt,
	isEmptyValue,
	isMapFunction,
	getDefaultValue,
	getTypeAnnotation,
	getEditorLineAndColumn
} from "./common-utils";
import { ArrayOutputNode, FocusedInputNode, InputNode, LinkConnectorNode, ObjectOutputNode, SubMappingNode } from "../Node";
import { ExpressionLabelModel } from "../Label";
import { DMTypeWithValue } from "../Mappings/DMTypeWithValue";
import { getPosition, isPositionsEquals } from "./st-utils";
import { PrimitiveOutputNode } from "../Node/PrimitiveOutput";
import { IDataMapperContext } from "src/utils/DataMapperContext/DataMapperContext";

export async function createSourceForMapping(sourcePort: InputOutputPortModel, targetPort: InputOutputPortModel, rhsValue?: string, suffix: string = '') {
	
	let source = "";
	let lhs = "";
	let rhs = "";

	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const fieldIndexes = getFieldIndexes(targetPort);
	const parentFieldNames: string[] = [];
	const { applyModifications } = targetNode.context;

	rhs = (rhsValue || buildInputAccessExpr(sourcePort.fieldFQN)) + suffix;
	lhs = getFieldNameFromOutputPort(targetPort, sourcePort);

	if (isMappedToRootArrayLiteralExpr(targetPort)
		|| isMappedToRootObjectLiteralExpr(targetPort)
		|| isMappedToObjectLitExprWithinArray(targetPort)
	) {
		let targetExpr: Node = targetPort?.typeWithValue.value;

		if (!targetExpr) {
			// When the return statement is not available in the function body
			const fnBody = targetNode.context.functionST.getBody() as Block;
			fnBody.addStatements([`return {};`]);
			const returnStatement = fnBody.getStatements()
				.find(statement => Node.isReturnStatement(statement)) as ReturnStatement;
			targetExpr = returnStatement.getExpression();
		} else if (Node.isCallExpression(targetExpr) && isMapFunction(targetExpr)) {
			const returnStmt = getCallExprReturnStmt(targetExpr);
			targetExpr = returnStmt.getExpression();
		}

		const valuePosition = getPosition(targetExpr);
		const isValueEmpty = isEmptyValue(valuePosition);

		if (!isValueEmpty) {
			const updatedTargetExpr = targetExpr.replaceWithText(rhs);
			await applyModifications(updatedTargetExpr.getSourceFile().getFullText());
			return rhs;
		}
	}

	let objectLitExpr;
	let parent = targetPort.parentModel;
	let fromFieldIndex = -1;

	while (parent != null && parent.parentModel) {
		const parentFieldName = getFieldNameFromOutputPort(parent, sourcePort);
		if (parentFieldName
			&& !(parent.field.kind === TypeKind.Interface && parent.parentModel.field.kind === TypeKind.Array)
		) {
			parentFieldNames.push(parentFieldName);
		}
		parent = parent.parentModel;
	}

	if (targetNode instanceof ObjectOutputNode) {
		if (targetNode.value) {
			const targetExpr = targetNode.value;
			if (Node.isObjectLiteralExpression(targetExpr)) {
				objectLitExpr = targetExpr;
			}
		} else {
			// When the return statement is not available in the function body
			const fnBody = targetNode.context.functionST.getBody() as Block;
			fnBody.addStatements([`return {};`]);
			const returnStatement = fnBody.getStatements()
				.find(statement => Node.isReturnStatement(statement)) as ReturnStatement;
			objectLitExpr = returnStatement.getExpression() as ObjectLiteralExpression;
		}
	} else if (targetNode instanceof ArrayOutputNode && targetNode.value) {
		const targetExpr = targetNode.value;
		if (Node.isArrayLiteralExpression(targetExpr)
			&& fieldIndexes !== undefined
			&& !!fieldIndexes.length
		) {
			objectLitExpr = getNextObjectLitExpr(targetExpr);
		}
	}

	let targetObjectLitExpr = objectLitExpr;

	if (parentFieldNames.length > 0) {
		const fieldNames = parentFieldNames.reverse();

		for (let i = 0; i < fieldNames.length; i++) {
			const fieldName = fieldNames[i];
			const propAssignment = getPropertyAssignment(objectLitExpr, fieldName);

			if (propAssignment && propAssignment.getInitializer()) {
				const valueExpr = propAssignment.getInitializer();

				if (!valueExpr.getText()) {
					const valueExprSource = constructValueExprSource(lhs, rhs, fieldNames, i);
					const updatedValueExpr = valueExpr.replaceWithText(valueExprSource);
					await applyModifications(updatedValueExpr.getSourceFile().getFullText());
					return valueExprSource;
				}

				if (Node.isObjectLiteralExpression(valueExpr)) {
					objectLitExpr = valueExpr;
				} else if (Node.isArrayLiteralExpression(valueExpr)
					&& fieldIndexes !== undefined && !!fieldIndexes.length) {
					objectLitExpr = getNextObjectLitExpr(valueExpr);
				} else if (Node.isAsExpression(valueExpr)) {
					const expr = valueExpr.getExpression();
					if (Node.isObjectLiteralExpression(expr)) {
						objectLitExpr = expr;
					} else if (Node.isArrayLiteralExpression(expr)
						&& fieldIndexes !== undefined && !!fieldIndexes.length) {
						objectLitExpr = getNextObjectLitExpr(expr);
					}
				}

				if (i === fieldNames.length - 1) {
					targetObjectLitExpr = objectLitExpr;
				}
			} else {
				fromFieldIndex = i;
				targetObjectLitExpr = objectLitExpr;
				break;
			}
		}

		if (fromFieldIndex >= 0 && fromFieldIndex <= fieldNames.length) {
			const missingFields = fieldNames.slice(fromFieldIndex);
			source = createPropAssignment(missingFields);
		} else {
			const propAssignment = getPropertyAssignment(targetObjectLitExpr, lhs);

			if (propAssignment && !propAssignment.getInitializer().getText()) {
				const valueExprSource = constructValueExprSource(lhs, rhs, [], 0);
				const updatedValueExpr = propAssignment.getInitializer().replaceWithText(valueExprSource);
				await applyModifications(updatedValueExpr.getSourceFile().getFullText());
				return valueExprSource;
			}
			source = `${lhs}: ${rhs}`;
		}
	} else {
		const propAssignment = getPropertyAssignment(targetObjectLitExpr, lhs);

		if (propAssignment && !propAssignment.getInitializer().getText()) {
			const valueExprSource = constructValueExprSource(lhs, rhs, [], 0);
			const updatedValueExpr = propAssignment.getInitializer().replaceWithText(valueExprSource);
			await applyModifications(updatedValueExpr.getSourceFile().getFullText());
			return valueExprSource;
		}
		source = `${lhs}: ${rhs}`;
	}

	if (targetObjectLitExpr) {
		const property = targetObjectLitExpr.getProperty(lhs);
		// Add new property only if the property with the lhs value doesn't exist
		// This can occur when adding dynamic fields
		if (!property) {
			const updatedTargetObjectLitExpr = targetObjectLitExpr.addProperty(writer => {
				writer.writeLine(source);
			});
			await applyModifications(updatedTargetObjectLitExpr.getSourceFile().getFullText());
		}
	} else if (targetNode instanceof ObjectOutputNode) {
		const updatedExpr = targetNode.value.replaceWithText(`{${getLinebreak()}${source}}`);
		await applyModifications(updatedExpr.getSourceFile().getFullText());
	}

	function createPropAssignment(missingFields: string[]): string {
		return missingFields.length > 0
			? `${missingFields[0]}: {${getLinebreak()}${createPropAssignment(missingFields.slice(1))}}`
			: `${lhs}: ${rhs}`;
	}

	function getNextObjectLitExpr(arrayLitExpr: ArrayLiteralExpression): ObjectLiteralExpression {
		const targetExpr = arrayLitExpr.getElements()[fieldIndexes.pop()];
		if (Node.isObjectLiteralExpression(targetExpr)) {
			return targetExpr;
		} else if (Node.isArrayLiteralExpression(targetExpr)) {
			return getNextObjectLitExpr(targetExpr);
		} else if (Node.isAsExpression(targetExpr)) {
			const expr = targetExpr.getExpression();
			if (Node.isObjectLiteralExpression(expr)) {
				return expr;
			} else if (Node.isArrayLiteralExpression(expr)) {
				return getNextObjectLitExpr(expr);
			}
		}
	}

	return `${lhs} = ${rhs}`;
}

export async function createSourceForUserInput(
	field: DMTypeWithValue,
	objectLitExpr: ObjectLiteralExpression,
	newValue: string,
	fnBody: Block,
	applyModifications?: (fileContent: string) => Promise<void>
): Promise<PropertyAssignment> {

	let source: string;
	let targetObjectLitExpr = objectLitExpr;
	const parentFields: string[] = [];
	let nextField = field;

	while (nextField && nextField.parentType) {
		const fieldName = nextField.type?.fieldName;
		const innerExpr = nextField.hasValue() && nextField.value;

		if (fieldName && !(innerExpr && Node.isObjectLiteralExpression(innerExpr))) {
			parentFields.push(fieldName);
		}

		if (nextField.parentType.hasValue() && Node.isPropertyAssignment(nextField.parentType.value)) {
			const parentField: PropertyAssignment = nextField.parentType.value;
			let parentFieldInitializer = parentField.getInitializer();

			if (Node.isAsExpression(parentFieldInitializer)) {
				parentFieldInitializer = parentFieldInitializer.getExpression();
			}

			if (!parentFieldInitializer.getText()) {
				const valueExprSource = constructValueExprSource(fieldName, newValue, parentFields.reverse(), 0);
				const propertyAssignment = parentField.setInitializer(valueExprSource);
				applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
				return propertyAssignment;
			}

			if (Node.isObjectLiteralExpression(parentFieldInitializer)) {
				const propAssignment = getPropertyAssignment(parentFieldInitializer, fieldName);

				if (propAssignment && !propAssignment.getInitializer().getText()) {
					const valExprSource = constructValueExprSource(fieldName, newValue, parentFields, 1);
					const propertyAssignment = propAssignment.setInitializer(valExprSource);
					applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
					return propertyAssignment;
				}
				source = createSpecificField(parentFields.reverse());
				targetObjectLitExpr = parentFieldInitializer;
			} else if (Node.isArrayLiteralExpression(parentFieldInitializer)
				&& Node.isObjectLiteralExpression(parentFieldInitializer.getElements()[0])) {

				for (const expr of parentFieldInitializer.getElements()) {
					if (Node.isObjectLiteralExpression(expr)
						&& isPositionsEquals(getPosition(expr), getPosition(objectLitExpr))) {
						const propAssignment = getPropertyAssignment(expr, fieldName);

						if (propAssignment && !propAssignment.getInitializer().getText()) {
							const valExprSource = constructValueExprSource(fieldName, newValue, parentFields, 1);
							const propertyAssignment = propAssignment.setInitializer(valExprSource);
							applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
							return propertyAssignment;
						}
						source = createSpecificField(parentFields.reverse());
						targetObjectLitExpr = expr;
					}
				}
			}
			nextField = undefined;
		} else {
			nextField = nextField?.parentType;
		}
	}

	if (!source) {
		const propAssignment = Node.isObjectLiteralExpression(targetObjectLitExpr)
			&& getPropertyAssignment(targetObjectLitExpr, field.type.fieldName);
		if (propAssignment && !propAssignment.getInitializer().getText()) {
			const valueExprSource = constructValueExprSource(field.originalType.fieldName, newValue, parentFields, 1);
			const propertyAssignment = propAssignment.setInitializer(valueExprSource);
			applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
			return propertyAssignment;
		}
		source = createSpecificField(parentFields.reverse());
	}

	if (Node.isObjectLiteralExpression(targetObjectLitExpr)) {
		const propertyAssignment = targetObjectLitExpr.addProperty(writer => {
			writer.writeLine(source);
		}) as PropertyAssignment;
		applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
		return propertyAssignment;
	} else {
		if (!targetObjectLitExpr) {
			// When the return statement is not available in the function body
			fnBody.addStatements([`return {}`]);
			const returnStatement = fnBody.getStatements()
				.find(statement => Node.isReturnStatement(statement)) as ReturnStatement;
			targetObjectLitExpr = returnStatement.getExpression() as ObjectLiteralExpression;
		}
		const modifiedTargetObjectLitExpr = targetObjectLitExpr
			.replaceWithText(`{${source}}`) as ObjectLiteralExpression;
		const propertyAssignment = modifiedTargetObjectLitExpr
			.getProperties()[modifiedTargetObjectLitExpr.getProperties().length - 1] as PropertyAssignment;
		applyModifications && (await applyModifications(propertyAssignment.getSourceFile().getFullText()));
		return propertyAssignment;
	}


	function createSpecificField(missingFields: string[]): string {
		return missingFields.length > 1
			? `\t${missingFields[0]}: {${createSpecificField(missingFields.slice(1))}}`
			: `\t${missingFields[0]}: ${newValue}`;
	}
}

export async function modifyFieldOptionality(
	field: DMTypeWithValue,
	isOptional: boolean,
	sourceFile: SourceFile,
	applyModifications: (fileContent: string) => Promise<void>) {

	const parentTypeDeclaration = getTypeDeclaration(field.parentType, sourceFile);
	if (parentTypeDeclaration) {
		parentTypeDeclaration.getProperty(field.type.fieldName)?.set({ hasQuestionToken: isOptional });
		await applyModifications(sourceFile.getFullText());
	}

}

export async function modifyChildFieldsOptionality(
	field: DMTypeWithValue,
	isOptional: boolean,
	sourceFile: SourceFile,
	applyModifications: (fileContent: string) => Promise<void>) {

	const typeDeclaration = getTypeDeclaration(field, sourceFile);
	if (typeDeclaration) {
		modifyTypeDeclarationOptionality(typeDeclaration, isOptional);
		await applyModifications(sourceFile.getFullText());
	}

}

function modifyTypeDeclarationOptionality(
	typeDeclaration: InterfaceDeclaration | TypeLiteralNode,
	isOptional: boolean) {

	typeDeclaration.getProperties().forEach(property => {
		property.set({ hasQuestionToken: isOptional });

		let propertyType = property?.getType();
		while (propertyType?.getArrayElementType())
			propertyType = propertyType.getArrayElementType();

		const propertyTypeDeclaration = propertyType?.getSymbol()?.getDeclarations()[0];
		if (Node.isInterfaceDeclaration(propertyTypeDeclaration) || Node.isTypeLiteral(propertyTypeDeclaration)) {
			modifyTypeDeclarationOptionality(propertyTypeDeclaration, isOptional);
		}
	});
}

function getTypeDeclaration(
	field: DMTypeWithValue,
	sourceFile: SourceFile): InterfaceDeclaration | TypeLiteralNode | undefined {

	const fieldIdentifiers: DMType[] = [];
	let currField = field;

	while (currField.parentType) {
		if (currField.type.fieldName)
			fieldIdentifiers.push(currField.type);
		currField = currField.parentType;
	}

	let currFieldType = currField.type;
	while (currFieldType.kind === TypeKind.Array)
		currFieldType = currFieldType.memberType;

	let currDeclaration: Node = sourceFile.getInterfaceOrThrow(currFieldType.typeName);

	while (fieldIdentifiers.length > 0) {
		const currIdentifier = fieldIdentifiers.pop();
		if (Node.isInterfaceDeclaration(currDeclaration) || Node.isTypeLiteral(currDeclaration)) {
			const currProperty = currDeclaration?.getProperty(currIdentifier.fieldName);

			let currPropertyType = currProperty?.getType();
			while (currPropertyType?.getArrayElementType())
				currPropertyType = currPropertyType.getArrayElementType();
			
			currDeclaration = currPropertyType?.getSymbol()?.getDeclarations()[0];
		}
	}

	if (Node.isInterfaceDeclaration(currDeclaration) || Node.isTypeLiteral(currDeclaration)) {
		return currDeclaration;
	}

	return undefined;
}

function constructValueExprSource(lhs: string, rhs: string, fieldNames: string[], fieldIndex: number) {
	let source = "";

	if (fieldIndex >= 0 && fieldIndex <= fieldNames.length) {
		const missingFields = fieldNames.slice(fieldIndex);
		source = createValueExpr(missingFields, true);
	} else {
		source = rhs;
	}

	function createValueExpr(missingFields: string[], isRoot?: boolean): string {
		return missingFields.length
			? isRoot
				? `{${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
				: `${missingFields[0]}: {${getLinebreak()}${createValueExpr(missingFields.slice(1))}}`
			: isRoot
				? rhs
				: `${lhs}: ${rhs}`;
	}

	return source;
}

export async function modifySourceForMultipleMappings(link: DataMapperLinkModel, suffix: string = '') {
	const targetPort = link.getTargetPort();
	if (!targetPort) {
		return;
	}

	let rhs = "";
	const sourcePort = link.getSourcePort();
	const targetNode = targetPort.getNode();

	if (sourcePort && sourcePort instanceof InputOutputPortModel) {
		rhs = buildInputAccessExpr(sourcePort.fieldFQN) + suffix;
	}

	if (targetNode instanceof LinkConnectorNode) {
		await targetNode.updateSource(rhs);
	} else {
		Object.keys(targetPort.getLinks()).forEach(async (linkId) => {

			if (linkId !== link.getID()) {
				const targetPortLink = targetPort.getLinks()[linkId];
				let valueNode: Node;

				if (sourcePort instanceof IntermediatePortModel) {
					if (sourcePort.getParent() instanceof LinkConnectorNode) {
						valueNode = (sourcePort.getParent() as LinkConnectorNode).innerNode;
					}
				} else if (targetPortLink.getLabels().length > 0) {
					valueNode = (targetPortLink.getLabels()[0] as ExpressionLabelModel).valueNode;
				} else if (
					targetNode instanceof ObjectOutputNode
					|| targetNode instanceof ArrayOutputNode
					|| targetNode instanceof PrimitiveOutputNode
				) {
					const linkConnector = targetNode.getModel().getNodes().find(node =>
						node instanceof LinkConnectorNode
						&& node.targetPort.portName === (targetPortLink.getTargetPort() as InputOutputPortModel).portName
					);
					valueNode = (linkConnector as LinkConnectorNode).innerNode;
				}

				const newSource = `${valueNode.getText()} + ${rhs}`;
				const updatedValueNode = valueNode.replaceWithText(newSource);
				await (targetNode as DataMapperNodeModel).context.applyModifications(updatedValueNode.getSourceFile().getFullText());
			}
		});
	}
}

export async function updateExistingValue(sourcePort: PortModel, targetPort: PortModel, newValue?: string, suffix: string = '') {
	const targetNode = targetPort.getNode() as DataMapperNodeModel;
	const sourceField = sourcePort && sourcePort instanceof InputOutputPortModel && sourcePort.fieldFQN;
	const sourceInputAccessExpr = (newValue || buildInputAccessExpr(sourceField)) + suffix;
	const typeWithValue = (targetPort as InputOutputPortModel).typeWithValue;
	const expr = typeWithValue.value;

	let updatedExpr;
	if (Node.isPropertyAssignment(expr)) {
		updatedExpr = expr.setInitializer(sourceInputAccessExpr);
	} else {
		updatedExpr = expr.replaceWithText(sourceInputAccessExpr);
	}

	await targetNode.context.applyModifications(updatedExpr.getSourceFile().getFullText());
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

export async function mapUsingCustomFunction(sourcePort: InputOutputPortModel, targetPort: InputOutputPortModel, context: IDataMapperContext, isValueModifiable: boolean) {
	
	const inputAccessExpr = buildInputAccessExpr(sourcePort.fieldFQN);
	const sourceFile = context.functionST.getSourceFile();
	const customFunction = genCustomFunction(sourcePort, targetPort, sourceFile);
	const customFunctionDeclaration = sourceFile.addFunction(customFunction);
	const range = getEditorLineAndColumn(customFunctionDeclaration);
	const customFunctionCallExpr = `${customFunction.name}(${inputAccessExpr})`;

	if (isValueModifiable) {
		await updateExistingValue(sourcePort, targetPort, customFunctionCallExpr);
	} else {
		await createSourceForMapping(sourcePort, targetPort, customFunctionCallExpr);
	}
	context.goToSource(range);
}

function getTypeIndexing(name: string){
	if ((name.startsWith('"') && name.endsWith('"')) ||
		(name.startsWith("'") && name.endsWith("'"))) {
		return `[${name}]`;
	}
	return `["${name}"]`;
}

function getTypeIndicesFromFQN(fieldFQN: string): string[] {
	const keys = fieldFQN?.split('.').map(key => isNaN(Number(key)) ? getTypeIndexing(key) : "[number]");
	return keys ?? [];
}

function getSourceTypeIndicesFromNode(node: Node, keys: string[]) {

	if (Node.isCallExpression(node) && isMapFunction(node)) {
		const mapExpr = node.getExpression() as PropertyAccessExpression;
		keys.unshift("[number]");
		let expr = mapExpr.getExpression();
		while (Node.isPropertyAccessExpression(expr)) {
			keys.unshift(getTypeIndexing(expr.getName()));
			expr = expr.getExpression();
		}
	} else if (Node.isFunctionDeclaration(node)) {
		const param = node.getParameters()[0];
		const paramType = param.getTypeNode();
		if (paramType) keys.unshift(paramType.getText());
		else keys.length = 0;
		return;
	}

	do {
		node = node.getParent();
	} while (node && !((Node.isCallExpression(node) && isMapFunction(node)) || Node.isFunctionDeclaration(node)));

	if (node) getSourceTypeIndicesFromNode(node, keys);

}

function getSourceTypeIndicesFromSM(smNode: SubMappingNode, keys: string[]) {
	const smName = keys.shift().replace('["', '').replace('"]', '');
	const sm = smNode.subMappings.find(sm => sm.name === smName);
	if(sm.type.typeName === "Object"){
		keys.length = 0;
	} else {
		keys.unshift(getTypeAnnotation(sm.type));
	}
}

function genSourceTypeAnnotation(sourcePort: InputOutputPortModel){
	const simpleTypeAnnotation = getTypeAnnotation(sourcePort.field);
	if(simpleTypeAnnotation) return simpleTypeAnnotation;

	const keys = getTypeIndicesFromFQN(sourcePort.optionalOmittedFieldFQN);
	const sourceParent = sourcePort.getParent();
	if(sourceParent instanceof InputNode || sourceParent instanceof FocusedInputNode) {
		keys.shift();
		getSourceTypeIndicesFromNode(sourceParent.value, keys);
	} else if(sourceParent instanceof SubMappingNode){
		getSourceTypeIndicesFromSM(sourceParent, keys);
	}
	
	return keys.join("") || "any";
}


function getTargetTypeIndicesFromNode(node: Node, keys: string[]) {
	if (Node.isPropertyAssignment(node)) {
		keys.unshift(getTypeIndexing(node.getName()));
	} else if (Node.isCallExpression(node) && isMapFunction(node)) {
		keys.unshift("[number]");
	} else if (Node.isFunctionDeclaration(node)) {
		const returnType = node.getReturnTypeNode();
		if (returnType) keys.unshift(returnType.getText());
		else keys.length = 0;
		return;
	} else if (Node.isVariableDeclaration(node)) {
		const varType = node.getTypeNode();
		if (varType) keys.unshift(varType.getText());
		else keys.length = 0;
		return;
	}

	do {
		node = node.getParent();
	} while (node && !(
		Node.isPropertyAssignment(node) ||
		(Node.isCallExpression(node) && isMapFunction(node)) ||
		Node.isFunctionDeclaration(node) ||
		Node.isVariableDeclaration(node)
	));
	
	if (node) getTargetTypeIndicesFromNode(node, keys);

}

function genTargetTypeAnnotation(targetPort: InputOutputPortModel){
	const simpleTypeAnnotation = getTypeAnnotation(targetPort.field);
	if(simpleTypeAnnotation) return simpleTypeAnnotation;

	const keys = getTypeIndicesFromFQN(targetPort.fieldFQN);
	const targetParent = targetPort.getParent();
	if(targetParent instanceof ObjectOutputNode || targetParent instanceof ArrayOutputNode) {
		getTargetTypeIndicesFromNode(targetParent.value, keys);
	}
	return keys.join("") || "any";
}



function genCustomFunction(sourcePort: InputOutputPortModel, targetPort: InputOutputPortModel, sourceFile: SourceFile) {

	const formattedSourceTypeName = getSimpleTypeName(sourcePort.field);
	const formattedTargetTypeName = getSimpleTypeName(targetPort.field);

	let customFunctionName = `map${formattedSourceTypeName}To${formattedTargetTypeName}`;

	const localFunctionNames = new Set(sourceFile.getFunctions().map(fn => fn.getName()));
	const importedFunctionNames = new Set(sourceFile.getImportDeclarations()
		.flatMap(importDecl => importDecl.getNamedImports().map(namedImport => namedImport.getName())));

	let i = 0;
	while (localFunctionNames.has(customFunctionName) || importedFunctionNames.has(customFunctionName)) {
		customFunctionName = `map${formattedSourceTypeName
			}To${formattedTargetTypeName
			}${isNaN(Number(formattedTargetTypeName.charAt(formattedTargetTypeName.length - 1))) ? '' : '_'
			}${++i}`;
	}

	return {
		name: customFunctionName,
		parameters: [{
			name: sourcePort.field.fieldName ||
				sourcePort.optionalOmittedFieldFQN?.replaceAll('.', '_') ||
				lowerFirst(sourcePort.field.typeName) ||
				sourcePort.field.kind,
			type: genSourceTypeAnnotation(sourcePort)
		}],
		returnType: genTargetTypeAnnotation(targetPort),
		statements: [
			`return ${getDefaultValue(targetPort.field)};`
		]
	}

	function getSimpleTypeName(field: DMType): string {
		let isArray = false;
		while (field.kind === TypeKind.Array) {
			isArray = true;
			field = field.memberType;
		}
		return upperFirst(field.typeName || field.kind) + (isArray ? "Array" : "");
	}

}

function isMappedToRootArrayLiteralExpr(targetPort: InputOutputPortModel): boolean {
	const targetExpr = targetPort?.typeWithValue?.value; // targetExpr is undefined when the body is missing the return statement
	return !targetPort.parentModel
		&& targetPort.field.kind === TypeKind.Array
		&& (
			!targetExpr || (targetExpr && Node.isArrayLiteralExpression(targetExpr)
			));
}

function isMappedToRootObjectLiteralExpr(targetPort: InputOutputPortModel): boolean {
	const targetExpr = targetPort?.typeWithValue?.value; // targetExpr is undefined when the body is missing the return statement
	return !targetPort.parentModel
		&& targetPort.field.kind === TypeKind.Interface
		&& (
			!targetExpr || (targetExpr && Node.isObjectLiteralExpression(targetExpr)
			));
}

function isMappedToObjectLitExprWithinArray(targetPort: InputOutputPortModel): boolean {
	return targetPort.index !== undefined
		&& targetPort.field.kind === TypeKind.Interface
		&& targetPort.typeWithValue?.value
		&& Node.isObjectLiteralExpression(targetPort.typeWithValue.value);
}
