import { ExpressionFunctionBody, FieldAccess, MappingConstructor, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortModel } from "../../Port";
import { getFieldNames } from "../../utils";
import { DataMapperNodeModel } from "../model/DataMapperNode";
 
export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {

    constructor(
        public context: IDataMapperContext,
		public value: ExpressionFunctionBody,
		public typeDef: TypeDefinition) {
        super(
            context,
            value,
            typeDef,
            false,
            true,
            EXPR_FN_BODY_NODE_TYPE
        );
    }

    initPorts(): void {
        this.addPorts(this.typeDef.typeDescriptor as RecordTypeDesc, "IN");
    }

    initLinks(): void {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        this.createLinks(mappings);
    }

	private genMappings(val: MappingConstructor, parentFields?: SpecificField[]) {
		let foundMappings: FieldAccessToSpecificFied[] = [];
		let currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			val.fields.forEach((field) => {
				if (STKindChecker.isSpecificField(field)) {
					if (STKindChecker.isMappingConstructor(field.valueExpr)) {
						foundMappings = [...foundMappings, ...this.genMappings(field.valueExpr, [...currentFields, field])];
					} else if (STKindChecker.isFieldAccess(field.valueExpr)
						|| STKindChecker.isSimpleNameReference(field.valueExpr)) {
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr));
					} else {
						// TODO handle other types of expressions here
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], undefined , field.valueExpr));
					}
				}
			})
		}
		return foundMappings;
	}

    
	private createLinks(mappings: FieldAccessToSpecificFied[]) {
		mappings.forEach((mapping) => {
			const { fields, value } = mapping;
			if (!value) {
				console.log(mapping);
				return;
			}
			const inputNode = this.getInputNodeExpr(value);
			let inPort: DataMapperPortModel; 
			if (inputNode) {
				inPort = this.getInputPortsForExpr(inputNode, value);	
			}
			const outPort = this.getOutputPortForField(fields);
			const lm = new DataMapperLinkModel();
			lm.addLabel(value.source);
			lm.setTargetPort(outPort);
			lm.setSourcePort(inPort);
			this.getModel().addAll(lm);
		});
	}

	private getOutputPortForField(fields: SpecificField[]) {
		let nextTypeNode = this.typeDef.typeDescriptor as RecordTypeDesc;
		let recField: RecordField;
		for (let i = 0; i < fields.length; i++) {
			const specificField = fields[i];
			const recFieldTemp = nextTypeNode.fields.find(
				(recF) => STKindChecker.isRecordField(recF) && recF.fieldName.value === specificField.fieldName.value);
			if (recFieldTemp) {
				if (i === fields.length - 1) {
					recField = recFieldTemp as RecordField;
				} else if (STKindChecker.isRecordTypeDesc(recFieldTemp.typeName)){
					nextTypeNode = recFieldTemp.typeName
				}
			}
		}
		if (recField) {
			const portId = md5(JSON.stringify(recField.position) + "IN");
			const outPort = this.getPort(portId);
			return outPort;
		}
	}

	// Improve to return multiple ports for complex expressions
	private getInputPortsForExpr(node: DataMapperNodeModel, expr: FieldAccess|SimpleNameReference) {
		const typeDesc = node.typeDef.typeDescriptor;
		if (STKindChecker.isRecordTypeDesc(typeDesc)) {
			if (STKindChecker.isFieldAccess(expr)) {
				const fieldNames = getFieldNames(expr);
				let nextTypeNode: RecordTypeDesc = typeDesc;
				for (let i = 0; i < fieldNames.length; i++) {
					const fieldName = fieldNames[i];
					const recField = nextTypeNode.fields.find(
						(field) => STKindChecker.isRecordField(field) && field.fieldName.value === fieldName);
					if (recField) {
						if (i === fieldNames.length - 1) {
							const portId = md5(JSON.stringify(recField.position) + "OUT");
							const port = (node.getPort(portId) as DataMapperPortModel);
							return port;
						} else if (STKindChecker.isRecordTypeDesc(recField.typeName)) {
							nextTypeNode = recField.typeName;
						}
					}
				}
			} else {
				// handle this when direct mapping parameters is enabled
			}
		}
	}

	private getInputNodeExpr(expr: FieldAccess|SimpleNameReference) {
		let nameRef = STKindChecker.isSimpleNameReference(expr) ? expr: undefined;
		if (!nameRef && STKindChecker.isFieldAccess(expr)) {
			let valueExpr = expr.expression;
			while (valueExpr && STKindChecker.isFieldAccess(valueExpr)) {
				valueExpr = valueExpr.expression;
			}
			if (valueExpr && STKindChecker.isSimpleNameReference(valueExpr)) {
				const paramNode = this.context.functionST.functionSignature.parameters
					.find((param) => 
						STKindChecker.isRequiredParam(param) 
						&& param.paramName?.value === (valueExpr as  SimpleNameReference).name.value
					) as RequiredParam;
				return this.findNodeByValueNode(paramNode);	
			}
		}
	}

	private findNodeByValueNode(value: ExpressionFunctionBody | RequiredParam) {
		let foundNode: DataMapperNodeModel;
		this.getModel().getNodes().find((node) => {
			var dmNode = node as DataMapperNodeModel;
			if (STKindChecker.isRequiredParam(value)
				&& STKindChecker.isRequiredParam(dmNode.value)
				&& value.paramName.value === dmNode.value.paramName.value) {
					foundNode = dmNode;
			} 
		});
		return foundNode;
	}
}