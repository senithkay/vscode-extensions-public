import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ExpressionFunctionBody, FieldAccess, MappingConstructor, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { FormFieldPortModel } from "../../Port";
import { getFieldNames } from "../../utils/dm-utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";
import { RequiredParamNode } from "../RequiredParam";

export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {

	public typeDef: FormField;

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
        const langClient = await this.context.getEELangClient();
        const res = await langClient.getTypeFromSymbol({
         documentIdentifier: {
             uri: `file://${this.context.currentFile.path}`
         },
         positions: [
             {
                 line: this.typeDesc.position.startLine,
                 offset: this.typeDesc.position.startColumn
             }
         ]
        });
        // tslint:disable-next-line:no-console
        console.log(JSON.stringify(res));

        const { type } = res.types[0];
        this.typeDef = type;

        if (type?.typeName && type.typeName === 'record') {
         const fields = type.fields;
         fields.forEach((subField) => {
             this.addPortsForFormField(subField, "IN", "exprFunctionBody");
         });
        }
 }

 async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        this.createLinks(mappings);
    }

	private createLinks(mappings: FieldAccessToSpecificFied[]) {
		mappings.forEach((mapping) => {
			const { fields, value, otherVal } = mapping;
			if (!value) {
				console.log("Unsupported mapping.");
				return;
			}
			const inputNode = this.getInputNodeExpr(value);
			let inPort: FormFieldPortModel;
			if (inputNode) {
				inPort = this.getInputPortsForExpr(inputNode, value);
			}
			const outPort = this.getOutputPortForField(fields);
			const lm = new DataMapperLinkModel(value);
			lm.addLabel(new ExpressionLabelModel({
				value: otherVal?.source || value.source,
				valueNode: otherVal || value,
				context: this.context,
				link: lm
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
		let nextTypeNode = this.typeDef;
		let recField: FormField;
		let portIdBuffer = "exprFunctionBody";
		for (let i = 0; i < fields.length; i++) {
			const specificField = fields[i];
			portIdBuffer += `.${specificField.fieldName.value}`
			const recFieldTemp = nextTypeNode.fields.find(
				(recF) => recF.name === specificField.fieldName.value);
			if (recFieldTemp) {
				if (i === fields.length - 1) {
					recField = recFieldTemp;
				} else if (recFieldTemp.typeName === 'record') {
					nextTypeNode = recFieldTemp
				}
			}
		}
		if (recField) {
			const portId = portIdBuffer + ".IN";
			const outPort = this.getPort(portId);
			return outPort;
		}
	}

	// Improve to return multiple ports for complex expressions
	private getInputPortsForExpr(node: RequiredParamNode, expr: FieldAccess | SimpleNameReference): FormFieldPortModel {
		const typeDesc = node.typeDef;
		let portIdBuffer = node.value.paramName.value;
		if (typeDesc.typeName === 'record') {
			if (STKindChecker.isFieldAccess(expr)) {
				const fieldNames = getFieldNames(expr); // input.Assets.AssetsNew
				let nextTypeNode: FormField = typeDesc;
				for (let i = 1; i < fieldNames.length; i++) { // Note i = 1 as we omit param name // Assets.AssetsNew
					const fieldName = fieldNames[i]; // Assets // AssetsNew
					portIdBuffer += `.${fieldName}`; // input.Assets  // input.Assets.AssetsNew
					const recField = nextTypeNode.fields.find(
						(field) => field.name === fieldName);  // record {..., record {...} AssetsNew, ...} Assets  //  record {...} AssetsNew
					if (recField) {
						if (i === fieldNames.length - 1) {
							const portId = portIdBuffer + ".OUT"; // input.Assets.AssetsNew.OUT
							const port = (node.getPort(portId) as FormFieldPortModel);
							return port;
						} else if (recField.typeName === 'record') {
							nextTypeNode = recField; // record {..., record {...} AssetsNew, ...}
						}
					}
				}
			} else {
				// handle this when direct mapping parameters is enabled
			}
		}
		return null;
	}

	private getInputNodeExpr(expr: FieldAccess | SimpleNameReference) {
		const nameRef = STKindChecker.isSimpleNameReference(expr) ? expr : undefined;
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
