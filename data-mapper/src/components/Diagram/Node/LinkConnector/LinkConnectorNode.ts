import { FieldAccess, SpecificField, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel } from "../../Port";
import { getInputNodeExpr, getInputPortsForExpr, getOutputPortForField } from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { MappingConstructorNode } from "../MappingConstructor";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: RecordFieldPortModel[] = [];
    public targetPort: RecordFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public value: string;
    public diagnostics: Diagnostic[];

    constructor(
        public context: IDataMapperContext,
        public valueNode: STNode,
        public editorLabel: string,
        public parentNode: STNode,
        public fieldAccessNodes: FieldAccess[],
        public fields: STNode[]) {
        super(
            context,
            LINK_CONNECTOR_NODE_TYPE
        );
        if (STKindChecker.isSpecificField(valueNode)) {
            this.value = valueNode.valueExpr ? valueNode.valueExpr.source.trim() : '';
            this.diagnostics = filterDiagnostics(this.context.diagnostics, valueNode.valueExpr.position);
        } else {
            this.value = valueNode.value ? valueNode.value.trim()  : valueNode.source.trim();
            this.diagnostics = filterDiagnostics(this.context.diagnostics, valueNode.position);
        }


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
            this.getModel().getNodes().map((node) => {
                if (node instanceof MappingConstructorNode) {
                    this.targetPort = getOutputPortForField(this.fields, node)
                    while (this.targetPort && this.targetPort.hidden) {
                        this.targetPort = this.targetPort.parentModel;
                    }
                }
            });
        }
    }

    initLinks(): void {
        this.sourcePorts.forEach((sourcePort, sourcePortIndex) => {
            const inPort = this.inPort;

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
        const targetPosition = STKindChecker.isSpecificField(this.valueNode)
            ? this.valueNode.valueExpr.position
            : this.valueNode.position;
        const modifications = [
            {
                type: "INSERT",
                config: {
                    "STATEMENT": this.value,
                },
                ...targetPosition
            }
        ];
        this.context.applyModifications(modifications);
    }

    public updatePosition() {
        const position = this.targetPort.getPosition()
        this.setPosition(800, position.y - 4)
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

    private targetLinkDelete(node: STNode) {
        if (STKindChecker.isSpecificField(node)) {
            if (STKindChecker.isSpecificField(this.context.selection.selectedST)
                && STKindChecker.isQueryExpression(this.context.selection.selectedST.valueExpr)) {
                // If query targetPort, should delete only value expression position
                this.context.applyModifications([{
                    type: "DELETE",
                    ...node.valueExpr.position
                }]);
            } else {
                this.deleteLink(node);
            }
        }
    }
}
