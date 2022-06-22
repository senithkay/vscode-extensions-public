import { DefaultLinkFactory, DefaultLinkWidget } from "@projectstorm/react-diagrams";
import React from "react";
import { DataMapperLinkModel } from "./DataMapperLink";

export class DataMapperLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('datamapper');
	}

	generateModel(): DataMapperLinkModel {
		return new DataMapperLinkModel();
	}

	generateReactWidget(event: { model: any; }): JSX.Element {
		return <DefaultLinkWidget link={event.model} diagramEngine={this.engine} />;
	}
}