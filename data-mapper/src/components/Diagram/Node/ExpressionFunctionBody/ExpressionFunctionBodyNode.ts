import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	ExpressionFunctionBody,
	MappingConstructor,
	SpecificField,
    STKindChecker,
    traversNode
} from "@wso2-enterprise/syntax-tree";

import { IDataMapperContext } from "../../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../../utils/st-utils";
import { ExpressionLabelModel } from "../../Label";
import { DataMapperLinkModel } from "../../Link";
import { EditableRecordField } from "../../Mappings/EditableRecordField";
import { FieldAccessToSpecificFied } from "../../Mappings/FieldAccessToSpecificFied";
import { RecordFieldPortModel } from "../../Port";
import {
    getBalRecFieldName,
    getEnrichedRecordType,
    getInputNodeExpr,
    getInputPortsForExpr
} from "../../utils/dm-utils";
import { filterDiagnostics } from "../../utils/ls-utils";
import { RecordTypeDescriptorStore } from "../../utils/record-type-descriptor-store";
import { LinkDeletingVisitor } from "../../visitors/LinkDeletingVistior";
import { DataMapperNodeModel, TypeDescriptor } from "../commons/DataMapperNode";

export const EXPR_FN_BODY_NODE_TYPE = "datamapper-node-expression-fn-body";

export class ExpressionFunctionBodyNode extends DataMapperNodeModel {

    public typeDef: Type;
    public enrichedTypeDef: EditableRecordField;

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

        if (this.typeDef) {
            const valueEnrichedType = getEnrichedRecordType(this.typeDef, this.value.expression);
            this.enrichedTypeDef = valueEnrichedType;
            if (valueEnrichedType.type.typeName === 'record') {
                const fields: EditableRecordField[] = valueEnrichedType.childrenTypes;
                if (!!fields.length) {
                    fields.forEach((subField) => {
                        this.addPortsForOutputRecordField(subField, "IN", "exprFunctionBody");
                    });
                }
            } else {
                // TODO: Add support for other return type descriptors
            }
        }
    }

    async initLinks() {
        const mappings = this.genMappings(this.value.expression as MappingConstructor);
        this.createLinks(mappings);
    }

    private createLinks(mappings: FieldAccessToSpecificFied[]) {
        mappings.forEach((mapping) => {
            const { fields, value, otherVal } = mapping;
            const specificField = fields[fields.length - 1];
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
            lm.addLabel(new ExpressionLabelModel({
                value: otherVal?.source || value.source,
                valueNode: otherVal || value,
                context: this.context,
                link: lm,
                specificField: specificField,
                deleteLink: () => this.deleteLink(specificField),
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
        });
    }

    private getOutputPortForField(fields: SpecificField[]) {
        let nextTypeNode = this.enrichedTypeDef?.childrenTypes;
        let recField: EditableRecordField;
        let portIdBuffer = "exprFunctionBody";
        let fieldIndex;
        for (let i = 0; i < fields.length; i++) {
            const specificField = fields[i];
            if (fieldIndex !== undefined) {
                portIdBuffer = `${portIdBuffer}.${fieldIndex}.${specificField.fieldName.value}`;
                fieldIndex = undefined;
            } else {
                portIdBuffer = `${portIdBuffer}.${specificField.fieldName.value}`
            }
            const recFieldTemp = nextTypeNode.find(
                (recF) => getBalRecFieldName(recF.type.name) === specificField.fieldName.value);
            if (recFieldTemp) {
                if (i === fields.length - 1) {
                    recField = recFieldTemp;
                } else if (recFieldTemp.type.typeName === 'record') {
                    nextTypeNode = recFieldTemp?.childrenTypes;
                } else if (recFieldTemp.type.typeName === 'array' && recFieldTemp.type.memberType.typeName === 'record') {
                    recFieldTemp.elements.forEach((element, index) => {
                        if (STKindChecker.isListConstructor(specificField.valueExpr)) {
                            specificField.valueExpr.expressions.forEach((expr) => {
                                if (isPositionsEquals(element.elementNode.position, expr.position)) {
                                    element.members.forEach((member) => {
                                        if (member?.value
                                            && isPositionsEquals(member.value.fieldName.position,
                                                fields[i + 1].fieldName.position)) {
                                            nextTypeNode = element?.members;
                                            fieldIndex = index;
                                            return;
                                        }
                                    });
                                }
                            })
                        }
                    })
                }
            }
        }
        if (recField) {
            const portId = `${portIdBuffer}.IN`;
            const outPort = this.getPort(portId);
            return outPort;
        }
    }

    private deleteLink(field: SpecificField) {
        const linkDeleteVisitor = new LinkDeletingVisitor(field.position, this.value.expression);
        traversNode(this.value.expression, linkDeleteVisitor);
        const nodePositionsToDelete = linkDeleteVisitor.getPositionToDelete();

        this.context.applyModifications([{
            type: "DELETE",
			...nodePositionsToDelete
        }]);
    }
}
