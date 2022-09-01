import { DiagramModel, NodeModel, NodeModelGenerics } from '@projectstorm/react-diagrams';
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
	AnydataTypeDesc, AnyTypeDesc, ArrayTypeDesc, BooleanTypeDesc, ByteTypeDesc, DecimalTypeDesc,
	DistinctTypeDesc, ErrorTypeDesc, FloatTypeDesc, FunctionTypeDesc, FutureTypeDesc, HandleTypeDesc,
	IntersectionTypeDesc, IntTypeDesc, JsonTypeDesc, MappingConstructor, MapTypeDesc, NeverTypeDesc, NilTypeDesc, ObjectTypeDesc,
	OptionalTypeDesc, ParenthesisedTypeDesc, QualifiedNameReference, ReadonlyTypeDesc, RecordTypeDesc,
	SimpleNameReference, SingletonTypeDesc, SpecificField, STKindChecker, StreamTypeDesc, StringTypeDesc, TableTypeDesc, traversNode,
	TupleTypeDesc, TypedescTypeDesc, UnionTypeDesc, XmlTypeDesc
} from '@wso2-enterprise/syntax-tree';

import { IDataMapperContext } from '../../../../utils/DataMapperContext/DataMapperContext';
import { FieldAccessToSpecificFied } from '../../Mappings/FieldAccessToSpecificFied';
import { RecordFieldPortModel, SpecificFieldPortModel } from "../../Port";
import { getBalRecFieldName } from "../../utils/dm-utils";
import { FieldAccessFindingVisitor } from '../../visitors/FieldAccessFindingVisitor';

export interface DataMapperNodeModelGenerics {
	PORT: SpecificFieldPortModel | RecordFieldPortModel;
}

export type TypeDescriptor = AnyTypeDesc | AnydataTypeDesc | ArrayTypeDesc | BooleanTypeDesc | ByteTypeDesc | DecimalTypeDesc
	| DistinctTypeDesc | ErrorTypeDesc | FloatTypeDesc | FunctionTypeDesc | FutureTypeDesc | HandleTypeDesc | IntTypeDesc
	| IntersectionTypeDesc | JsonTypeDesc | MapTypeDesc | NeverTypeDesc | NilTypeDesc | ObjectTypeDesc | OptionalTypeDesc
	| ParenthesisedTypeDesc | QualifiedNameReference | ReadonlyTypeDesc | RecordTypeDesc | SimpleNameReference
	| SingletonTypeDesc | StreamTypeDesc | StringTypeDesc | TableTypeDesc | TupleTypeDesc | TypedescTypeDesc | UnionTypeDesc
	| XmlTypeDesc;


export interface IDataMapperNodeFactory {

}

export abstract class DataMapperNodeModel extends NodeModel<NodeModelGenerics & DataMapperNodeModelGenerics> {

	private diagramModel: DiagramModel;

	constructor(
		public context: IDataMapperContext,
		type: string) {
		super({
			type
		});
	}

	public setModel(model: DiagramModel) {
		this.diagramModel = model;
	}

	public getModel() {
		return this.diagramModel;
	}

	abstract initPorts(): void;
	abstract initLinks(): void;
	// extend this class to add link init, port init logics

	protected addPortsForSpecificField(field: SpecificField, type: "IN" | "OUT", parentId: string,
									                           parent?: SpecificFieldPortModel) {
		const fieldId = `${parentId}.${field.fieldName.value}`;
		if (STKindChecker.isSpecificField(field)) {
			const fieldPort = new SpecificFieldPortModel(field, type, parentId, "", parent);
			this.addPort(fieldPort)
			if (STKindChecker.isMappingConstructor(field.valueExpr)) {
				field.valueExpr.fields.forEach((subField) => {
					if (STKindChecker.isSpecificField(subField)) {
						this.addPortsForSpecificField(subField, type, fieldId, fieldPort);
					}
				});
			}
		}
	}

	protected addPortsForRecordField(field: Type, type: "IN" | "OUT", parentId: string, parentFieldAccessExpr?: string,
									                         parent?: RecordFieldPortModel) {
		const fieldName = getBalRecFieldName(field.name);
		const fieldId = `${parentId}.${fieldName}`;
		const fieldAccessExpr = `${parentFieldAccessExpr}.${fieldName}`;
		const fieldPort = new RecordFieldPortModel(field, type, parentId, parentFieldAccessExpr, parent);
		this.addPort(fieldPort)
		if (field.typeName === 'record') {
			field.fields.forEach((subField) => {
				this.addPortsForRecordField(subField, type, fieldId, fieldAccessExpr, fieldPort);
			});
		}
	}

	protected genMappings(val: MappingConstructor, parentFields?: SpecificField[]) {
		let foundMappings: FieldAccessToSpecificFied[] = [];
		const currentFields = [...(parentFields ? parentFields : [])];
		if (val) {
			val.fields.forEach((field) => {
				if (STKindChecker.isSpecificField(field)) {
					if (STKindChecker.isMappingConstructor(field.valueExpr)) {
						foundMappings = [...foundMappings, ...this.genMappings(field.valueExpr, [...currentFields, field])];
					} else if (STKindChecker.isFieldAccess(field.valueExpr)
						|| STKindChecker.isSimpleNameReference(field.valueExpr)) {
						foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], field.valueExpr));
					} else {
						const fieldAccessFindingVisitor : FieldAccessFindingVisitor = new FieldAccessFindingVisitor();
						traversNode(field.valueExpr, fieldAccessFindingVisitor);
						const fieldAccesseNodes = fieldAccessFindingVisitor.getFieldAccesseNodes();
						if (fieldAccesseNodes.length === 1){
							foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], fieldAccesseNodes[1], field.valueExpr));
						}
						else {
							foundMappings.push(new FieldAccessToSpecificFied([...currentFields, field], undefined , field.valueExpr));
						}
					}
				}
			})
		}
		return foundMappings;
	}
}
