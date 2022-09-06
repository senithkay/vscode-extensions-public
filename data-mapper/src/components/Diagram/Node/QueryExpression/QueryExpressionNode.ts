import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    QueryExpression,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel } from "../../Port";
import { getFieldNames } from "../../utils/dm-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, FromClauseNode } from "../FromClause";
import { MappingConstructorNode } from "../MappingConstructor";
import { RequiredParamNode } from "../RequiredParam";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export const QUERY_SOURCE_PORT_PREFIX = "queryExpr.source";

export const QUERY_TARGET_PORT_PREFIX = "queryExpr.target";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: Type;
    public sourcePort: RecordFieldPortModel;
    public targetPort: RecordFieldPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

    public sourceBindingPattern: CaptureBindingPattern;

    constructor(
        public context: IDataMapperContext,
        public value: QueryExpression,
        public parentNode: STNode) {
        super(
            context,
            QUERY_EXPR_NODE_TYPE
        );
    }

    async initPorts() {
        await this.getSourceType();
        await this.getTargetType();
        this.inPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.position) + "IN")
            , "IN"
        );
        this.addPort(this.inPort);
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.position) + "OUT")
            , "OUT"
        );
        this.addPort(this.outPort);
    }

    private async getSourceType() {
        const sourceFieldAccess = this.value.queryPipeline.fromClause.expression;
        const bindingPattern = this.value.queryPipeline.fromClause.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;
            if (STKindChecker.isFieldAccess(sourceFieldAccess)) {
                const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
                const type = recordTypeDescriptors.getTypeDescriptor({
                    startLine: sourceFieldAccess.position.startLine,
                    startColumn: sourceFieldAccess.position.startColumn,
                    endLine: sourceFieldAccess.position.endLine,
                    endColumn: sourceFieldAccess.position.endColumn
                });

                if (type && type.typeName === 'array') {
                    this.sourceTypeDesc = type.memberType;
                }

                const fieldNames = getFieldNames(sourceFieldAccess);
                const fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV}` : cV, "");

                this.getModel().getNodes().map((node) => {
                    if (node instanceof RequiredParamNode && node.value.paramName.value === fieldNames[0]) {
                        this.sourcePort = node.getPort(fieldId + ".OUT") as RecordFieldPortModel;
                    } else if (node instanceof FromClauseNode
                        && STKindChecker.isCaptureBindingPattern(node.value.typedBindingPattern.bindingPattern)
                        && node.value.typedBindingPattern.bindingPattern.source.trim() === fieldNames[0].trim())
                    {
                        this.sourcePort = node.getPort(
                            `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${fieldId}.OUT`) as RecordFieldPortModel;
                    }
                });
            }
        }
    }

    private async getTargetType() {
        const fieldNamePosition = STKindChecker.isSpecificField(this.parentNode) && this.parentNode.fieldName.position;
        if (!fieldNamePosition) {
            return;
        }
        this.getModel().getNodes().map((node) => {
            if (node instanceof MappingConstructorNode) {
                const ports = Object.entries(node.getPorts());
                ports.map((entry) => {
                    const port = entry[1];
                    if (port instanceof RecordFieldPortModel
                        && port?.editableRecordField && port.editableRecordField?.value
                        && isPositionsEquals(port.editableRecordField.value.fieldName.position, fieldNamePosition)
                    ) {
                        this.targetPort = port;
                    }
                });
            }
        });
    }

    initLinks(): void {
        // Currently, we create links from "IN" ports and back tracing the inputs.
        if (this.sourcePort && this.inPort) {
            const link = new DataMapperLinkModel(undefined);
            link.setSourcePort(this.sourcePort);
            link.setTargetPort(this.inPort);
            link.registerListener({
                selectionChanged(event) {
                    if (event.isSelected) {
                        this.sourcePort.fireEvent({}, "link-selected");
                        this.inPort.fireEvent({}, "link-selected");
                    } else {

                        this.sourcePort.fireEvent({}, "link-unselected");
                        this.inPort.fireEvent({}, "link-unselected");
                    }
                },
            })
            this.getModel().addAll(link);
        }

        // TODO - temp hack to render link
        if (this.outPort && this.targetPort) {
            const link = new DataMapperLinkModel(undefined);
            link.setSourcePort(this.outPort);
            link.setTargetPort(this.targetPort);
            link.registerListener({
                selectionChanged(event) {
                    if (event.isSelected) {
                        this.targetPort[1].fireEvent({}, "link-selected");
                        this.outPort.fireEvent({}, "link-selected");
                    } else {
                        this.targetPort[1].fireEvent({}, "link-unselected");
                        this.outPort.fireEvent({}, "link-unselected");
                    }
                },
            })
            this.getModel().addAll(link);
        }
    }

    public updatePosition() {
        if (this.targetPort){
            const position = this.targetPort.getPosition()
            this.setPosition(position.x - 200, position.y - 10)
        }
    }
}
