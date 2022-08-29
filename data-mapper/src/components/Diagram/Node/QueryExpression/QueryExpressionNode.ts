import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, QueryExpression, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { IntermediatePortModel, RecordFieldPortModel, SpecificFieldPortModel } from "../../Port";
import { getFieldNames } from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, FromClauseNode } from "../FromClause";
import { RequiredParamNode } from "../RequiredParam";
import { EXPANDED_QUERY_TARGET_PORT_PREFIX, SelectClauseNode } from "../SelectClause";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export const QUERY_SOURCE_PORT_PREFIX = "queryExpr.source";

export const QUERY_TARGET_PORT_PREFIX = "queryExpr.target";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: Type;
    public sourcePort: RecordFieldPortModel;
    public targetPort: RecordFieldPortModel | SpecificFieldPortModel;

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
        this.initSourcePorts();
        this.initTargetPorts();
    }

    private initSourcePorts() {
        // TODO - only supporting single capture binding pattern in from clause yet
        if (this.sourceBindingPattern) {
            const parentId = `${QUERY_SOURCE_PORT_PREFIX}.${this.sourceBindingPattern.variableName.value}`;
            this.sourceTypeDesc.fields.forEach((field) => {
                this.addPortsForRecordField(field, "OUT", parentId, this.sourceBindingPattern.variableName.value);
            });
        }
    }

    private initTargetPorts() {
        const selectClause = this.value.selectClause;
        if (STKindChecker.isMappingConstructor(selectClause.expression)) {
            selectClause.expression.fields.forEach((field) => {
                if (STKindChecker.isSpecificField(field)) {
                    this.addPortsForSpecificField(field, "IN", QUERY_TARGET_PORT_PREFIX);
                }
            });
        }
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
        // TODO get target type from specific field instead of select clause
        this.getModel().getNodes().map((node) => {
                if (node instanceof ExpressionFunctionBodyNode) {
                    const ports = Object.entries(node.getPorts());
                    ports.map((entry) => {
                        const port = entry[1];
                        if (port instanceof SpecificFieldPortModel) {
                            if (STKindChecker.isRecordField(port.field)) {
                                if (port.field.fieldName.value === "Assets") {
                                    this.targetPort = port;
                                }
                            }
                        } else if (port instanceof RecordFieldPortModel && port.field.name === 'Assets') {
                            this.targetPort = port;
                        }
                    });
                } else if (node instanceof SelectClauseNode) {
                    const specificField = STKindChecker.isSpecificField(this.parentNode) && this.parentNode.fieldName.value;
                    this.targetPort = node.getPort(
                        `${EXPANDED_QUERY_TARGET_PORT_PREFIX}.${specificField}.IN`) as SpecificFieldPortModel;
                }
        });
    }

    initLinks(): void {
        this.initQueryLinks();
        if (STKindChecker.isMappingConstructor(this.value.selectClause.expression)) {
            const mappings = this.genMappings(this.value.selectClause.expression);
            mappings.forEach((mapping) => {
                const { fields, value, otherVal } = mapping;
                const targetPortId = `${QUERY_TARGET_PORT_PREFIX}${fields.reduce((pV, cV) => `${pV}.${cV.fieldName.value}`, "")}.IN`;
                if (value && STKindChecker.isFieldAccess(value)) {
                    const fieldNames = getFieldNames(value);
                    const sourcePortId = `${QUERY_SOURCE_PORT_PREFIX}${fieldNames.reduce((pV, cV) => `${pV}.${cV}`, "")}.OUT`;
                    const targetPort = this.getPort(targetPortId);
                    const sourcePort = this.getPort(sourcePortId);

                    const link = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position));
                    link.setSourcePort(sourcePort);
                    link.setTargetPort(targetPort);
                    link.addLabel(new ExpressionLabelModel({
                        value: otherVal?.source || value.source,
                        valueNode: otherVal || value,
                        context: this.context,
                        link,
                        specificField: fields[fields.length - 1]
                    }));
                    link.registerListener({
                        selectionChanged(event) {
                            if (event.isSelected) {
                                sourcePort.fireEvent({}, "link-selected");
                                targetPort.fireEvent({}, "link-selected");
                            } else {
                                sourcePort.fireEvent({}, "link-unselected");
                                targetPort.fireEvent({}, "link-unselected");
                            }
                        },
                    })
                    this.getModel().addAll(link);
                } else {
                    // handle simple name ref case for direct variable mapping
                }
            });
        } else {
            // TODO: handle returning singlular values from select
        }
    }

    private initQueryLinks() {
        // Currently we create links from "IN" ports and back tracing the inputs.


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
