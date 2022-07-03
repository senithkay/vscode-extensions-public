import { ExpressionFunctionBody, FieldAccess, MappingConstructor, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortModel } from "../../Port";
import { getFieldNames } from "../../utils";
import { DataMapperNodeModel, TypeDescriptor } from "../model/DataMapperNode";
import { RequiredParamNode } from "../RequiredParam";
 
export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {

	public typeDef: TypeDefinition;

    constructor(
        public context: IDataMapperContext,
		public value: ExpressionFunctionBody,
		public typeDesc: TypeDescriptor) {
        super(
            context,
            EXPR_FN_BODY_NODE_TYPE
        );
    }

    async initPorts() {
		this.typeDef = await getTypeDefinitionForTypeDesc(this.typeDesc, this.context);
        this.addPorts(this.typeDef.typeDescriptor as RecordTypeDesc, "IN");
    }

    async initLinks() {
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
			lm.addLabel(new ExpressionLabelModel({
				value: value.source,
				valueNode: value,
				context: this.context
			}));
			lm.setTargetPort(outPort);
			lm.setSourcePort(inPort);
			lm.registerListener({
				selectionChanged(event) {
					if (event.isSelected) {
						inPort.fireEvent({}, "link-selected");
						outPort.fireEvent({}, "link-selected");
					} else {
						inPort.fireEvent({}, "link-unselected");
						outPort.fireEvent({}, "link-unselected");
					}
				},
			})
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
	private getInputPortsForExpr(node: RequiredParamNode, expr: FieldAccess|SimpleNameReference) {
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

	private findNodeByValueNode(value: ExpressionFunctionBody | RequiredParam): RequiredParamNode {
		let foundNode: RequiredParamNode;
		this.getModel().getNodes().find((node) => {
			if (STKindChecker.isRequiredParam(value)
				&& node instanceof RequiredParamNode
				&& STKindChecker.isRequiredParam(node.value)
				&& value.paramName.value === node.value.paramName.value) {
					foundNode = node;
			} 
		});
		return foundNode;
	}
}