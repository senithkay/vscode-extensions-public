import { LinkModel, PortModel, PortModelGenerics } from '@projectstorm/react-diagrams';
import { MappingConstructor, RecordField, RecordTypeDesc, STKindChecker } from '@wso2-enterprise/syntax-tree';

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
	let lhs = "";
	let rhs = "";
	if (link.getTargetPort()) {
		const targetPort = link.getTargetPort() as DataMapperPortModel;
		const targetNode = targetPort.getNode() as DataMapperNodeModel;
		if (STKindChecker.isExpressionFunctionBody(targetNode.value)) {
			const mappingConstruct = targetNode.value.expression as MappingConstructor;
			console.log(mappingConstruct.fields);
		}
		lhs = (STKindChecker.isRecordField(targetPort.typeNode)
			? targetPort.typeNode.fieldName.value : "");
		let parent = targetPort.parentModel;
		while (parent != null) {
			lhs = (STKindChecker.isRecordField(parent.typeNode)
			? parent.typeNode.fieldName.value + "." : "") + lhs;
			if (!parent.parentModel) {

			}
			parent = parent.parentModel;
		}
	}

	if (link.getSourcePort()) {
		const sourcePort = link.getSourcePort() as DataMapperPortModel;
		rhs = (STKindChecker.isRecordField(sourcePort.typeNode)
			? sourcePort.typeNode.fieldName.value : "");
		let parent = sourcePort.parentModel;
		while (parent != null) {
			rhs = (STKindChecker.isRecordField(parent.typeNode)
			? parent.typeNode.fieldName.value + "." : "")  + rhs;
			if (!parent.parentModel) {

			}
			parent = parent.parentModel;
		}
	}
	return `${lhs}: ${rhs}`;
}
