import { FieldAccess, SpecificField, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel, SpecificFieldPortModel } from "../../Port";
import { getInputNodeExpr, getInputPortsForExpr } from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";
import { EXPANDED_QUERY_TARGET_PORT_PREFIX, SelectClauseNode } from "../SelectClause";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: RecordFieldPortModel[] = [];
    public targetPort: RecordFieldPortModel | SpecificFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public value: string;
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
        this.value = valueNode.valueExpr ? valueNode.valueExpr.source.trim() : '';
        this.diagnostics = filterDiagnostics(this.context.diagnostics, valueNode.valueExpr.position)

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
            const inputNode = getInputNodeExpr(field, this);
            if (inputNode) {
                this.sourcePorts.push(getInputPortsForExpr(inputNode, field));
            }
        })

        if (this.outPort) {
            let targetPortName = "exprFunctionBody"
            if (STKindChecker.isQueryExpression(this.context.selection.selectedST)) {
                targetPortName = EXPANDED_QUERY_TARGET_PORT_PREFIX
            }
            this.specificFields.forEach((specificField) => {
                targetPortName = targetPortName + "." + specificField.fieldName.value
            })
            targetPortName = targetPortName + ".IN"
            this.getModel().getNodes().map((node) => {
                if (node instanceof ExpressionFunctionBodyNode || node instanceof SelectClauseNode) {
                    const ports = Object.entries(node.getPorts());
                    ports.forEach((entry) => {
                        const portName = entry[0];
                        if (portName === targetPortName) {
                            if (entry[1] instanceof RecordFieldPortModel || entry[1] instanceof SpecificFieldPortModel)
                                this.targetPort = entry[1]
                        }
                    });
                }
            });
        }
    }

    initLinks(): void {
        this.sourcePorts.forEach((sourcePort, sourcePortIndex) => {
            const inPort =this.inPort;

            const lm = new DataMapperLinkModel();
            lm.setTargetPort(this.inPort);
            lm.setSourcePort(sourcePort);

            const fieldAccessNode = this.fieldAccessNodes[sourcePortIndex];

            lm.addLabel(new ExpressionLabelModel({
                context: this.context,
                link: lm,
                deleteLink: () => this.deleteLink(fieldAccessNode),
            }));

            lm.registerListener({
                selectionChanged(event) {
                    if (event.isSelected) {
                        inPort.fireEvent({}, "link-selected");
                        sourcePort.fireEvent({}, "link-selected");
                    } else {
                        inPort.fireEvent({}, "link-unselected");
                        sourcePort.fireEvent({}, "link-unselected");
                    }
                },
            })
            this.getModel().addAll(lm);
        })

        if (this.targetPort) {
            const outPort = this.outPort;
            const targetPort = this.targetPort;

            const lm = new DataMapperLinkModel();
            lm.setTargetPort(this.targetPort);
            lm.setSourcePort(this.outPort);

            lm.addLabel(new ExpressionLabelModel({
                context: this.context,
                link: lm,
                deleteLink: () => this.targetLinkDelete(this.valueNode),
            }));

            lm.registerListener({
                selectionChanged(event) {
                    if (event.isSelected) {
                        outPort.fireEvent({}, "link-selected");
                        targetPort.fireEvent({}, "link-selected");
                    } else {
                        outPort.fireEvent({}, "link-unselected");
                        targetPort.fireEvent({}, "link-unselected");
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
		this.setPosition(800, position.y - 10)
	}

    public hasError(): boolean {
        return this.diagnostics.length > 0;
    }

    private deleteLink(specificField: SpecificField | FieldAccess) {
        const linkDeleteVisitor = new LinkDeletingVisitor(specificField.position, this.parentNode);
        traversNode(this.parentNode, linkDeleteVisitor);
        const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

        this.context.applyModifications([{
            type: "DELETE",
            ...nodePositionsToDelete
        }]);
    }

    private targetLinkDelete(specificField: SpecificField) {
        if (this.targetPort?.parentId === EXPANDED_QUERY_TARGET_PORT_PREFIX) {
            // If query targetPort, should delete only value expression position
            this.context.applyModifications([{
                type: "DELETE",
                ...specificField.valueExpr.position
            }]);
        } else {
            this.deleteLink(specificField)
        }
    }
}