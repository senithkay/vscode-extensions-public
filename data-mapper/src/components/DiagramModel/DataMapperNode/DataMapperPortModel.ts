import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';

export class DataMapperPortModel extends PortModel {
	constructor(id: string, type: "IN"|"OUT") {
		super({
			type: 'datamapper',
			name: id,
			alignment: type == 'IN'? PortModelAlignment.LEFT : PortModelAlignment.RIGHT
		});
	}

	createLinkModel(): LinkModel {
		return new DefaultLinkModel();
	}
}
