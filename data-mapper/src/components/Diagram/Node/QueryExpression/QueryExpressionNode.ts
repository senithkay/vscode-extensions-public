import { CaptureBindingPattern, QueryExpression, RecordField, RecordTypeDesc, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { getTypeDescForFieldName } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { DataMapperPortModel } from "../../Port";
import { IntermediatePortModel } from "../../Port/IntermediatePort/IntermediatePortModel";
import { getFieldNames, getParamForName, isPositionsEquals } from "../../utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";
import { EXPANDED_QUERY_SOURCE_PORT_PREFIX, QueryExprSourceNode } from "../QueryExprSourceNode";
import { RequiredParamNode } from "../RequiredParam";
import { EXPANDED_QUERY_TARGET_PORT_PREFIX, SelectClauseNode } from "../SelectClause";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export const QUERY_SOURCE_PORT_PREFIX = "queryExpr.source";

export const QUERY_TARGET_PORT_PREFIX = "queryExpr.target";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public targetTypeDesc: RecordTypeDesc;
    public sourcePort: DataMapperPortModel;
    public targetPort: DataMapperPortModel;

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
                if (STKindChecker.isRecordField(field)) {
                    this.addPorts(field, "OUT", parentId, this.sourceBindingPattern.variableName.value);
                }
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
        const expr = this.value.queryPipeline.fromClause.expression;
        const bindingPattern = this.value.queryPipeline.fromClause.typedBindingPattern.bindingPattern;
        if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
            this.sourceBindingPattern = bindingPattern;
            if (STKindChecker.isFieldAccess(expr)) {
                this.sourceTypeDesc = await getTypeDescForFieldName(expr.fieldName, this.context);
            }
        }

        const sourceFieldAccess = this.value.queryPipeline.fromClause.expression;
        if (STKindChecker.isFieldAccess(sourceFieldAccess)) {
            const fieldNames = getFieldNames(sourceFieldAccess);
            const fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV}` : cV, "");

            if (STKindChecker.isFunctionDefinition(this.context.selection.selectedST)) {
                const paramNode = this.getModel().getNodes().find((node) =>
                    node instanceof RequiredParamNode
                    && node.value.paramName.value === fieldNames[0]) as RequiredParamNode;
                this.sourcePort = paramNode.getPort(fieldId + ".OUT") as DataMapperPortModel;
            } else {
                const paramNode = this.getModel().getNodes().find((node) =>
                    node instanceof QueryExprSourceNode
                    && STKindChecker.isCaptureBindingPattern(node.value.typedBindingPattern.bindingPattern)
                    && node.value.typedBindingPattern.bindingPattern.source.trim() === fieldNames[0].trim()
                ) as QueryExprSourceNode;
                this.sourcePort = paramNode.getPort(
                    `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${fieldId}.OUT`) as DataMapperPortModel;
            }
        }
    }

    private async getTargetType() {
        // TODO get target type from specific field instead of select clause
        const selectClause = this.value.selectClause;
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
                    const link = new DataMapperLinkModel(value);
                    link.setSourcePort(sourcePort);
                    link.setTargetPort(targetPort);
                    link.addLabel(new ExpressionLabelModel({
                        value: otherVal?.source || value.source,
                        valueNode: otherVal || value,
                        context: this.context,
                        link
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
            const link = new DataMapperLinkModel();
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
        if (this.outPort) {
            let targetPort: DataMapperPortModel;
            if (STKindChecker.isFunctionDefinition(this.context.selection.selectedST)) {
                const targetNode = this.getModel().getNodes().find((node) =>
                    node instanceof ExpressionFunctionBodyNode
                );
                const ports = Object.entries(targetNode.getPorts());
                ports.map((entry) => {
                    const port = entry[1];
                    if (port instanceof DataMapperPortModel) {
                        if (STKindChecker.isRecordField(port.field)) {
                            if (port.field.fieldName.value === "Assets") {
                                targetPort = port;
                            }
                        }
                    }
                });
            } else {
                const targetNode = this.getModel().getNodes().find((node) =>
                    node instanceof SelectClauseNode
                ) as SelectClauseNode;
                const specificField = STKindChecker.isSpecificField(this.parentNode) && this.parentNode.fieldName.value;
                targetPort = targetNode.getPort(
                    `${EXPANDED_QUERY_TARGET_PORT_PREFIX}.${specificField}.IN`) as DataMapperPortModel;
            }

            if (targetPort) {
                const link = new DataMapperLinkModel();
                link.setSourcePort(this.outPort);
                link.setTargetPort(targetPort);
                link.registerListener({
                    selectionChanged(event) {
                        if (event.isSelected) {
                            targetPort[1].fireEvent({}, "link-selected");
                            this.outPort.fireEvent({}, "link-selected");
                        } else {
                            targetPort[1].fireEvent({}, "link-unselected");
                            this.outPort.fireEvent({}, "link-unselected");
                        }
                    },
                })
                this.getModel().addAll(link);
            }
        }
    }
}
