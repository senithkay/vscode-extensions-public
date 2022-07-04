import { QueryExpression, RecordField, RecordTypeDesc, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import md5 from "blueimp-md5";
import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { DataMapperPortModel } from "../../Port";
import { IntermediatePortModel } from "../../Port/IntermediatePort/IntermediatePortModel";
import { getFieldNames, getParamForName } from "../../utils";
import { DataMapperNodeModel } from "../model/DataMapperNode";
import { RequiredParamNode } from "../RequiredParam";

export const QUERY_EXPR_NODE_TYPE = "datamapper-node-query-expr";

export class QueryExpressionNode extends DataMapperNodeModel {

    public sourceTypeDesc: RecordTypeDesc;
    public targetTypeDesc: RecordTypeDesc;
    public sourcePort: DataMapperPortModel;
    public targetPort: DataMapperPortModel;

    public inPort: IntermediatePortModel;
    public outPort: IntermediatePortModel;

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
        this.outPort = new IntermediatePortModel(
            md5(JSON.stringify(this.value.position) + "OUT")
            , "OUT"
        );
    }

    async getSourceType() {
        const sourceFieldAccess = this.value.queryPipeline.fromClause.expression;
        if (STKindChecker.isFieldAccess(sourceFieldAccess)) {
            const fieldNames = getFieldNames(sourceFieldAccess);
            const param = getParamForName(fieldNames[0], this.context.functionST);
            const paramNode = this.getModel().getNodes().find((node) => 
                node instanceof RequiredParamNode
                && node.value.paramName.value === fieldNames[0]) as RequiredParamNode;
            const paramTypeDesc = paramNode.typeDef.typeDescriptor as RecordTypeDesc;
            let nextRecTypeDesc = paramTypeDesc;
            let sourceTypeDesc: RecordTypeDesc;
            for (let i = 1; i < fieldNames.length; i++) {
              const field = nextRecTypeDesc.fields.find((field) => 
                    STKindChecker.isRecordField(field) && field.fieldName.value === fieldNames[i]) as RecordField;
              if (i === fieldNames.length - 1) {
                const fieldType = field.typeName;
                if (STKindChecker.isArrayTypeDesc(fieldType) 
                    && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc)) {
                    sourceTypeDesc = fieldType.memberTypeDesc;
                }
                this.sourcePort = paramNode.getPort(md5(JSON.stringify(field.position) + "OUT")) as DataMapperPortModel;
                console.log(this.sourcePort);
              } else if (STKindChecker.isRecordTypeDesc(field.typeName)) {
                nextRecTypeDesc = field.typeName; // TODO Handle other cases
              }
            }
            this.sourceTypeDesc = sourceTypeDesc;
        }
    }

    async getTargetType() {
        // TODO get target type from specific field instead of select clause
        const selectClause = this.value.selectClause;
        // console.log(selectClause)
    }

    initLinks(): void {
        // Currently we create links from "IN" ports and back tracing the inputs.
    }
}