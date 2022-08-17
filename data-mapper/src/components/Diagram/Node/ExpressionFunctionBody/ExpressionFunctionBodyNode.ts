import { ExpressionFunctionBody, FieldAccess, MappingConstructor, NodePosition, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, traversNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDefinitionForTypeDesc } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { DataMapperPortModel } from "../../Port";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { getFieldNames, getInputNodeExpr, getInputPortsForExpr, getOutputPortForField } from "../../utils";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";
import { RequiredParamNode } from "../RequiredParam";
import { filterDiagnostics } from "../../utils/ls-utils";
 
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
		const recordTypeDesc = this.typeDef.typeDescriptor as RecordTypeDesc;

		const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
		await recordTypeDescriptors.retrieveTypeDescriptors(recordTypeDesc, this.context)

		recordTypeDesc.fields.forEach((subField) => {
			if (STKindChecker.isRecordField(subField)) {
				this.addPorts(subField, "IN", "exprFunctionBody");
			}
		});
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
			const inputNode = getInputNodeExpr(value);
			let inPort: DataMapperPortModel;
			if (inputNode) {
				inPort = getInputPortsForExpr(inputNode, value);
			}
			const outPort = getOutputPortForField(fields);


			const lm = new DataMapperLinkModel(value, filterDiagnostics( this.context.diagnostics, value.position));
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

	
}
