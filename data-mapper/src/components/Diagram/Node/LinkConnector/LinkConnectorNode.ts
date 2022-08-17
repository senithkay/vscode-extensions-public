import { ExpressionFunctionBody, FieldAccess, RecordTypeDesc, RequiredParam, SimpleNameReference, SpecificField, STKindChecker, STNode, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { DataMapperPortModel, IntermediatePortModel } from "../../Port";
import { getFieldNames } from "../../utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";
import { RequiredParamNode } from "../RequiredParam";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: DataMapperPortModel[] = [];
    public targetPort: DataMapperPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public 	value: string;
	public diagnostics: Diagnostic[];
    
    constructor(
        public context: IDataMapperContext,
		public valueNode: SpecificField,
        public parentNode: STNode,
        public fieldAccessNodes: FieldAccess[],
        public specificFields: SpecificField[]) {
        super(
            context,
            LINK_CONNECTOR_NODE_TYPE
        );
        this.value = valueNode.valueExpr ? valueNode.valueExpr.source : '';
		this.diagnostics = filterDiagnostics( this.context.diagnostics, valueNode.valueExpr.position)

    }

    initPorts(): void {

        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(this.valueNode.position) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.valueNode.position) + "OUT")
            , "OUT"
        );
        this.addPort(this.outPort);
    
        this.fieldAccessNodes.forEach((field) => {
        const inputNode = this.getInputNodeExpr(field);
			if (inputNode) {
				this.sourcePorts.push(this.getInputPortsForExpr(inputNode, field));
			}
        })

        if (this.outPort) {
            let targetPortName = "exprFunctionBody"
            this.specificFields.forEach((specificField) =>{
                targetPortName = targetPortName +"."+specificField.fieldName.value
            })
            targetPortName = targetPortName +".IN"
            let targetPort: DataMapperPortModel;
            this.getModel().getNodes().map((node) => {
                    if (node instanceof ExpressionFunctionBodyNode) {
                        const ports = Object.entries(node.getPorts());
                        ports.forEach((entry) => {
                            const portName = entry[0];
                            if (portName === targetPortName) {
                                if (entry[1] instanceof DataMapperPortModel)
                                this.targetPort = entry[1]
                             }
                        });
                    } 
            });
        }
    }

    initLinks(): void {
        this.sourcePorts.forEach((sourcePort) => {

        const lm = new DataMapperLinkModel();
			lm.setTargetPort(this.inPort);
			lm.setSourcePort(sourcePort);
			lm.registerListener({
				selectionChanged(event) {
					if (event.isSelected) {
						this.inPort.fireEvent({}, "link-selected");
						sourcePort.fireEvent({}, "link-selected");
					} else {
						this.inPort.fireEvent({}, "link-unselected");
						sourcePort.fireEvent({}, "link-unselected");
					}
				},
			})
			this.getModel().addAll(lm);
        })

        if (this.targetPort){

            const lm = new DataMapperLinkModel();
			lm.setTargetPort(this.targetPort);
			lm.setSourcePort(this.outPort);
			lm.registerListener({
				selectionChanged(event) {
					if (event.isSelected) {
						this.outPort.fireEvent({}, "link-selected");
						this.targetPort.fireEvent({}, "link-selected");
					} else {
						this.outPort.fireEvent({}, "link-unselected");
						this.targetPort.fireEvent({}, "link-unselected");
					}
				},
			})
			this.getModel().addAll(lm);
        }
    }
    private getInputPortsForExpr(node: RequiredParamNode, expr: FieldAccess|SimpleNameReference) {
		const typeDesc = node.typeDef.typeDescriptor;
		let portIdBuffer = node.value.paramName.value;
		if (STKindChecker.isRecordTypeDesc(typeDesc)) {
			if (STKindChecker.isFieldAccess(expr)) {
				const fieldNames = getFieldNames(expr);
				let nextTypeNode: RecordTypeDesc = typeDesc;
				for (let i = 1; i < fieldNames.length; i++) { // Note i = 1 as we omit param name
					const fieldName = fieldNames[i];
					portIdBuffer += `.${fieldName}`;
					const recField = nextTypeNode.fields.find(
						(field) => STKindChecker.isRecordField(field) && field.fieldName.value === fieldName);
					if (recField) {
						if (i === fieldNames.length - 1) {
							const portId = portIdBuffer + ".OUT";
							const port = (node.getPort(portId) as DataMapperPortModel);
							return port;
						} else if (STKindChecker.isRecordTypeDesc(recField.typeName)) {
							nextTypeNode = recField.typeName;
						} else if (STKindChecker.isSimpleNameReference(recField.typeName) ){
							const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
							const typeDef = recordTypeDescriptors.gettypeDescriptor(recField.typeName.name.value)
							nextTypeNode = typeDef.typeDescriptor as RecordTypeDesc
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
			let valueNodeExpr = expr.expression;
			while (valueNodeExpr && STKindChecker.isFieldAccess(valueNodeExpr)) {
				valueNodeExpr = valueNodeExpr.expression;
			}
			if (valueNodeExpr && STKindChecker.isSimpleNameReference(valueNodeExpr)) {
				const paramNode = this.context.functionST.functionSignature.parameters
					.find((param) => 
						STKindChecker.isRequiredParam(param) 
						&& param.paramName?.value === (valueNodeExpr as  SimpleNameReference).name.value
					) as RequiredParam;
				return this.findNodeByValueNode(paramNode);	
			}
		}
	}

    private findNodeByValueNode(valueNode: ExpressionFunctionBody | RequiredParam): RequiredParamNode {
		let foundNode: RequiredParamNode;
		this.getModel().getNodes().find((node) => {
			if (STKindChecker.isRequiredParam(valueNode)
				&& node instanceof RequiredParamNode
				&& STKindChecker.isRequiredParam(node.value)
				&& valueNode.paramName.value === node.value.paramName.value) {
					foundNode = node;
			} 
		});
		return foundNode;
	}

    async updateSource() {
		const modifications = [
			{
				type: "INSERT",
				config: {
					"STATEMENT": this.value,
				},
				endColumn: this.valueNode.valueExpr.position.endColumn,
				endLine: this.valueNode.valueExpr.position.endLine,
				startColumn: this.valueNode.valueExpr.position.startColumn,
				startLine: this.valueNode.valueExpr.position.startLine
			}
		];
		this.context.applyModifications(modifications);
	}


	public updatePosition() {
		const position = this.targetPort.getPosition()
		this.setPosition(position.x - 200, position.y - 10)
	}

	public hasError(): boolean {
		return this.diagnostics.length > 0 ;
	}
    
}