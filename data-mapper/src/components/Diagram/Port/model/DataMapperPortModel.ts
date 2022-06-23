import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';
import { MappingConstructor, NodePosition, RecordField, RecordTypeDesc, SpecificField, STKindChecker } from '@wso2-enterprise/syntax-tree';

import md5 from "blueimp-md5";

import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';
import { DataMapperNodeModel } from '../../Node/model/DataMapperNode';
export interface DataMapperNodeModelGenerics {
	PORT: DataMapperPortModel;
}
export class DataMapperPortModel extends PortModel<PortModelGenerics & DataMapperNodeModelGenerics> {
	public readonly typeNode: RecordField | RecordTypeDesc;
	public readonly parentModel: DataMapperPortModel;
	public readonly portType: "IN" | "OUT";

	constructor(typeNode: RecordField | RecordTypeDesc, type: "IN" | "OUT", parentModel?: DataMapperPortModel) {
		super({
			type: 'datamapper',
			name: md5(JSON.stringify(typeNode.position) + type),
		});
		this.typeNode = typeNode;
		this.parentModel = parentModel;
		this.portType = type;
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: (evt) => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (evt) => {

				lm.addLabel(createSpecificFieldSource(lm));
			}
		});
		return lm;
	}
}

function createSpecificFieldSource(link: DataMapperLinkModel) {
	let source = "";
	let lhs = "";
	let rhs = "";
	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;

		rhs = (STKindChecker.isRecordField(sourcePort.typeNode)
			? sourcePort.typeNode.fieldName.value : "");
		let parent = sourcePort.parentModel;
		while (parent != null) {
			rhs = (STKindChecker.isRecordField(parent.typeNode)
				? parent.typeNode.fieldName.value + "." : "") + rhs;
			parent = parent.parentModel;
		}
		const sourceNode = sourcePort.getNode() as DataMapperNodeModel;
		if (STKindChecker.isRequiredParam(sourceNode.value)) {
			rhs = sourceNode.value.paramName.value + "." + rhs;
		}
	}

	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort() as DataMapperPortModel;
		lhs = STKindChecker.isRecordField(targetPort.typeNode)
			? targetPort.typeNode.fieldName.value : "";

		let parentFieldNames: string[] = [];
		let parent = targetPort.parentModel;
		while (parent != null) {
			if (STKindChecker.isRecordField(parent.typeNode)) {
				parentFieldNames.push(parent.typeNode.fieldName.value);
			};
			parent = parent.parentModel;
		}
		const targetNode = targetPort.getNode() as DataMapperNodeModel;
		if (STKindChecker.isExpressionFunctionBody(targetNode.value)) {
			let mappingConstruct = targetNode.value.expression as MappingConstructor;
			let targetPos = undefined;
			let targetMappingConstruct = undefined;
			let fromFieldIdx = -1;
			if (parentFieldNames.length > 0) {
				const fieldNames = parentFieldNames.reverse();
				for (let i = 0; i < fieldNames.length; i++) {
					const fieldName = fieldNames[i];
					if (mappingConstruct) {
						const specificField = mappingConstruct.fields.find((val) => STKindChecker.isSpecificField(val) && val.fieldName.value === fieldName) as SpecificField;
						if (specificField && specificField.valueExpr) {
							mappingConstruct = specificField.valueExpr as MappingConstructor;
						} else {
							fromFieldIdx = i;
							targetMappingConstruct = mappingConstruct;
							break;
						}
					}
				}
				const createSpeficField = (missingFields: string[]) => {
					let source = "";
					if (missingFields.length > 0) {
						source = `\t${missingFields[0]}: {\n${createSpeficField(missingFields.slice(1))}}`;
					} else {
						source = `\t${lhs}: ${rhs}\n`;
					}
					return source;
				}
				if (fromFieldIdx >= 0 && fromFieldIdx <= fieldNames.length) {
					const missingFields = fieldNames.slice(fromFieldIdx);
					source = createSpeficField(missingFields);
				}
				console.log(source);
			} else {
				const openBrancePos = mappingConstruct.openBrace.position as NodePosition;
				console.log(openBrancePos);
				source = `${lhs}: ${rhs}`;
				console.log(source);
			}
		}
	}
	return source;
}
