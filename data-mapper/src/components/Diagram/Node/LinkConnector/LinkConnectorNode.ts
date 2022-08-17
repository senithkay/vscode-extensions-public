import { FieldAccess,  SpecificField, STNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { DataMapperPortModel, IntermediatePortModel } from "../../Port";
import { getInputNodeExpr, getInputPortsForExpr } from "../../utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";

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
        const inputNode = getInputNodeExpr(field);
			if (inputNode) {
				this.sourcePorts.push(getInputPortsForExpr(inputNode, field));
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