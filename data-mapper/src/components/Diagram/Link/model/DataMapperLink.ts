import { DefaultLinkModel } from "@projectstorm/react-diagrams";

export const LINK_TYPE_ID = "datamapper-link";

export class DataMapperLinkModel extends DefaultLinkModel {
	constructor() {
		super({
			type: LINK_TYPE_ID,
			width: 1,
			curvyness: 25,
			locked: true,
			color: "#5567D5"
		});
	}
}
