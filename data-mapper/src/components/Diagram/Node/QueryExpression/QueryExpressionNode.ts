import { FormField } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CaptureBindingPattern, QueryExpression, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FormFieldPortModel, IntermediatePortModel, STNodePortModel } from "../../Port";
import { getFieldNames } from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { DataMapperNodeModel } from "../commons/DataMapperNode";
import { ExpressionFunctionBodyNode } from "../ExpressionFunctionBody";
import { FromClauseNode } from "../FromClause";
import { RequiredParamNode } from "../RequiredParam";
import { EXPANDED_QUERY_TARGET_PORT_PREFIX, SelectClauseNode } from "../SelectClause";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export const QUERY_SOURCE_PORT_PREFIX = "queryExpr.source";

export const QUERY_TARGET_PORT_PREFIX = "queryExpr.target";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: FormField;
    public sourcePort: FormFieldPortModel;
    public targetPort: FormFieldPortModel;

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
                this.addPortsForFormField(field, "OUT", parentId, this.sourceBindingPattern.variableName.value);
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
                const fieldNames = getFieldNames(sourceFieldAccess);
                const fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV}` : cV, "");

                const paramNode = this.getModel().getNodes().find((node) =>
                    (node instanceof RequiredParamNode && node.value.paramName.value === fieldNames[0])
                    || (node instanceof FromClauseNode
                        && STKindChecker.isCaptureBindingPattern(node.value.typedBindingPattern.bindingPattern)
                        && node.value.typedBindingPattern.bindingPattern.variableName.value === fieldNames[0])
                );
                if (paramNode instanceof RequiredParamNode) {
                    let nextRecTypeDesc = paramNode.typeDef;
                    let sourceTypeDesc: FormField;
                    for (let i = 1; i < fieldNames.length; i++) {
                        const field = nextRecTypeDesc.fields.find((formField) =>
                            formField.name === fieldNames[i]);
                        if (i === fieldNames.length - 1) {
                            if (field.typeName === 'array' && field.memberType.typeName === 'record') {
                                sourceTypeDesc = field.memberType;
                            }
                            this.sourcePort = paramNode.getPort(fieldId + ".OUT") as FormFieldPortModel;
                        } else if (field.typeName === 'record') {
                            nextRecTypeDesc = field; // TODO Handle other cases
                        }
                    }
                    this.sourceTypeDesc = sourceTypeDesc;
                } else if (paramNode instanceof FromClauseNode) {

                }

                // #####################################
                // // this.sourceTypeDesc = await getTypeDescForFieldName(sourceFieldAccess.fieldName, this.context);
                // this.sourceTypeDesc = undefined;
                //
                // this.getModel().getNodes().map((node) => {
                //     if (node instanceof RequiredParamNode && node.value.paramName.value === fieldNames[0]) {
                //         // this.sourcePort = node.getPort(fieldId + ".OUT") as PortModel;
                //         this.sourcePort = undefined;
                //     } else if (node instanceof FromClauseNode
                //         && STKindChecker.isCaptureBindingPattern(node.value.typedBindingPattern.bindingPattern)
                //         && node.value.typedBindingPattern.bindingPattern.source.trim() === fieldNames[0].trim())
                //     {
                //         // this.sourcePort = node.getPort(
                //         //     `${EXPANDED_QUERY_SOURCE_PORT_PREFIX}.${fieldId}.OUT`) as PortModel;
                //         this.sourcePort = undefined;
                //     }
                // });

                // #####################################
            }
        }
    }

    // private async getSourceType() {
    //     const sourceFieldAccess = this.value.queryPipeline.fromClause.expression;
    //     const bindingPattern = this.value.queryPipeline.fromClause.typedBindingPattern.bindingPattern;
    //     if (STKindChecker.isCaptureBindingPattern(bindingPattern)) {
    //         this.sourceBindingPattern = bindingPattern;
    //         if (STKindChecker.isFieldAccess(sourceFieldAccess)) {
    //             const fieldNames = getFieldNames(sourceFieldAccess);
    //             const fieldId = fieldNames.reduce((pV, cV) => pV ? `${pV}.${cV}` : cV, "");
    //             const paramNode = this.getModel().getNodes().find((node) =>
    //                 node instanceof RequiredParamNode
    //                 && node.value.paramName.value === fieldNames[0]) as RequiredParamNode;
    //             let nextRecTypeDesc = paramNode.typeDef;
    //             let sourceTypeDesc: FormField;
    //             for (let i = 1; i < fieldNames.length; i++) {
    //                 const field = nextRecTypeDesc.fields.find((formField) =>
    //                     formField.name === fieldNames[i]);
    //                 if (i === fieldNames.length - 1) {
    //                     if (field.typeName === 'array' && field.memberType.typeName === 'record') {
    //                         sourceTypeDesc = field.memberType;
    //                     }
    //                     this.sourcePort = paramNode.getPort(fieldId + ".OUT") as FormFieldPortModel;
    //                 } else if (field.typeName === 'record') {
    //                     nextRecTypeDesc = field; // TODO Handle other cases
    //                 }
    //             }
    //             this.sourceTypeDesc = sourceTypeDesc;
    //         }
    //     }
    // }

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

                    const link = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position));
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
        if (this.outPort) {
            let targetPort: STNodePortModel | FormFieldPortModel;
            this.getModel().getNodes().map((node) => {
                    if (node instanceof ExpressionFunctionBodyNode) {
                        const ports = Object.entries(node.getPorts());
                        ports.map((entry) => {
                            const port = entry[1];
                            if (port instanceof STNodePortModel) {
                                if (STKindChecker.isRecordField(port.field)) {
                                    if (port.field.fieldName.value === "Assets") {
                                        targetPort = port;
                                    }
                                }
                            } else if (port instanceof FormFieldPortModel && port.field.name === 'Assets') {
                                targetPort = port;
                            }
                        });
                    } else if (node instanceof SelectClauseNode) {
                        const specificField = STKindChecker.isSpecificField(this.parentNode) && this.parentNode.fieldName.value;
                        targetPort = node.getPort(
                            `${EXPANDED_QUERY_TARGET_PORT_PREFIX}.${specificField}.IN`) as STNodePortModel;
                    }
            });

            if (targetPort) {
                const link = new DataMapperLinkModel(undefined);
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
