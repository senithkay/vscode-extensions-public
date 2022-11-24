import { PrimitiveBalType, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FieldAccess,
    OptionalFieldAccess,
    SimpleNameReference,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { Diagnostic } from "vscode-languageserver-protocol";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel } from "../../Port";
import { OFFSETS, PRIMITIVE_TYPE_TARGET_PORT_PREFIX } from "../../utils/constants";
import {
    getDefaultValue,
    getInputNodeExpr,
    getInputPortsForExpr,
    getOutputPortForField
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ListConstructorNode } from "../ListConstructor";
import { MappingConstructorNode } from "../MappingConstructor";
import { PrimitiveTypeNode } from "../PrimitiveType";

export const LINK_CONNECTOR_NODE_TYPE = "link-connector-node";

export class LinkConnectorNode extends DataMapperNodeModel {

    public sourcePorts: RecordFieldPortModel[] = [];
    public targetMappedPort: RecordFieldPortModel;
    public targetPort: RecordFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public value: string;
    public diagnostics: Diagnostic[];
    public hidden: boolean;

    constructor(
        public context: IDataMapperContext,
        public valueNode: STNode,
        public editorLabel: string,
        public parentNode: STNode,
        public fieldAccessNodes: (FieldAccess | OptionalFieldAccess | SimpleNameReference)[],
        public fields: STNode[],
        public isPrimitiveTypeArrayElement?: boolean) {
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
                if (node instanceof MappingConstructorNode
                    || node instanceof PrimitiveTypeNode
                    || node instanceof ListConstructorNode)
                {
                    if (STKindChecker.isFunctionDefinition(this.parentNode)
                        || STKindChecker.isQueryExpression(this.parentNode))
                    {
                        if (node instanceof PrimitiveTypeNode) {
                            this.targetPort = node.getPort(
                                `${PRIMITIVE_TYPE_TARGET_PORT_PREFIX}.${node.recordField.type.typeName}.IN`
                            ) as RecordFieldPortModel;
                        }
                        this.targetMappedPort = this.targetPort;
                    } else {
                        [this.targetPort, this.targetMappedPort] = getOutputPortForField(this.fields, node);
                    }
                    if (this.targetMappedPort?.portName !== this.targetPort?.portName) {
                        this.hidden = true;
                    }
                }
            });
        }
    }

    initLinks(): void {
        if (!this.hidden) {
            this.sourcePorts.forEach((sourcePort, sourcePortIndex) => {
                const inPort = this.inPort;

                const lm = new DataMapperLinkModel(undefined, undefined, true);
                lm.setTargetPort(this.inPort);
                lm.setSourcePort(sourcePort);
                sourcePort.addLinkedPort(this.inPort);
                sourcePort.addLinkedPort(this.targetMappedPort)

                const fieldAccessNode = this.fieldAccessNodes[sourcePortIndex];

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

            if (this.targetMappedPort) {
                const outPort = this.outPort;
                const targetPort = this.targetMappedPort;

                const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);
                lm.setTargetPort(this.targetMappedPort);
                lm.setSourcePort(this.outPort);

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
        } else {
            if (this.targetMappedPort) {
                this.sourcePorts.forEach((sourcePort, sourcePortIndex) => {
                    const inPort = this.targetMappedPort;

                    const lm = new DataMapperLinkModel(undefined, this.diagnostics, true);
                    lm.setTargetPort(this.targetMappedPort);
                    lm.setSourcePort(sourcePort);
                    sourcePort.addLinkedPort(this.targetMappedPort);

                    const fieldAccessNode = this.fieldAccessNodes[sourcePortIndex];

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
            }
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
        const position = this.targetMappedPort.getPosition()
        this.setPosition(this.hasError() ? OFFSETS.LINK_CONNECTOR_NODE_WITH_ERROR.X : OFFSETS.LINK_CONNECTOR_NODE.X, position.y - 2)
    }

    public hasError(): boolean {
        return this.diagnostics.length > 0;
    }

    public deleteLink() {
        const targetField = this.targetPort.field;
        let modifications: STModification[];
        if (!targetField?.name && targetField?.typeName !== PrimitiveBalType.Array
            && targetField?.typeName !== PrimitiveBalType.Record)
        {
            // Fallback to the default value if the target is a primitive type element
            modifications = [{
                type: "INSERT",
                config: {
                    "STATEMENT": getDefaultValue(targetField)
                },
                ...this.valueNode.position
            }];
        } else {
            const linkDeleteVisitor = new LinkDeletingVisitor(this.valueNode.position, this.parentNode);
            traversNode(this.context.selection.selectedST.stNode, linkDeleteVisitor);
            const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

            modifications = [{
                type: "DELETE",
                ...nodePositionsToDelete
            }];
        }

        this.context.applyModifications(modifications);
    }
}
