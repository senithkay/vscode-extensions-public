import { LinkModel, PortModel, DefaultLinkModel, PortModelAlignment } from '@projectstorm/react-diagrams';
import { DataMapperLinkModel } from '../../Link/model/DataMapperLink';

export class DataMapperPortModel extends PortModel {
	constructor(id: string, type: "IN" | "OUT") {
		super({
			type: 'datamapper',
			name: id,
			alignment: type == 'IN' ? PortModelAlignment.LEFT : PortModelAlignment.RIGHT
		});
	}

	createLinkModel(): LinkModel {
		const lm = new DataMapperLinkModel();
		lm.registerListener({
			sourcePortChanged: (evt) => {
				// lm.addLabel(evt.port.getName() + " = " + lm.getTargetPort().getName());
			},
			targetPortChanged: (evt) => {

				lm.addLabel( evt.port.getName() + " = " + lm.getSourcePort().getName());
			}
		});
		return lm;
	}
}
