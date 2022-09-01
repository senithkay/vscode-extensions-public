import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	ExpressionFunctionBody,
	MappingConstructor,
	SpecificField
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import { getInputNodeExpr, getInputPortsForExpr } from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {

    public typeDef: Type;

    constructor(
        public context: IDataMapperContext,
        public value: ExpressionFunctionBody,
        public typeDesc: TypeDescriptor) {
        super(
            context,
            EXPR_FN_BODY_NODE_TYPE
        );
    }

    async initPorts() {
        const recordTypeDescriptors = RecordTypeDescriptorStore.getInstance();
        this.typeDef = recordTypeDescriptors.getTypeDescriptor({
          startLine: this.typeDesc.position.startLine,
          startColumn: this.typeDesc.position.startColumn,
          endLine: this.typeDesc.position.startLine,
          endColumn: this.typeDesc.position.startColumn
        });

        if (this.typeDef && this.typeDef.typeName === 'record') {
            const fields = this.typeDef.fields;
            fields.forEach((subField) => {
                this.addPortsForRecordField(subField, "IN", "exprFunctionBody");
            });
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        this.createLinks(mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            if (!value) {
                console.log("Unsupported mapping.");
                return;
            }
            const inputNode = getInputNodeExpr(value, this);
            let inPort: RecordFieldPortModel;
            if (inputNode) {
                inPort = getInputPortsForExpr(inputNode, value);
            }
            const outPort = this.getOutputPortForField(fields);
			const lm = new DataMapperLinkModel(value, filterDiagnostics(this.context.diagnostics, value.position));
            if (inPort && outPort) {
                lm.addLabel(new ExpressionLabelModel({
                  value: otherVal?.source || value.source,
                  valueNode: otherVal || value,
                  context: this.context,
                  link: lm
                }));
              lm.setTargetPort(outPort);
              lm.setSourcePort(inPort);
              lm.registerListener({
                selectionChanged(event) {
                  if (event.isSelected) {
                    inPort.fireEvent({}, "link-selected");
                    outPort.fireEvent({}, "link-selected");
                  } else {
                    inPort.fireEvent({}, "link-unselected");
                    outPort.fireEvent({}, "link-unselected");
                  }
                },
              })
              this.getModel().addAll(lm);
            }
        });
    }

    private getOutputPortForField(fields: SpecificField[]) {
        let nextTypeNode = this.typeDef;
        let recField: Type;
        let portIdBuffer = "exprFunctionBody";
        for (let i = 0; i < fields.length; i++) {
            const specificField = fields[i];
            portIdBuffer += `.${specificField.fieldName.value}`
            const recFieldTemp = nextTypeNode.fields.find(
                (recF) => recF.name === specificField.fieldName.value);
            if (recFieldTemp) {
                if (i === fields.length - 1) {
                    recField = recFieldTemp;
                } else if (recFieldTemp.typeName === 'record') {
                    nextTypeNode = recFieldTemp
                }
            }
        }
        if (recField) {
            const portId = portIdBuffer + ".IN";
            const outPort = this.getPort(portId);
            return outPort;
        }
    }
}
