import { DefaultLinkFactory } from "@projectstorm/react-diagrams";
import { WorkerLinkModel } from "./LinkModel";
import { LinkWidget } from "./LinkWidget";
import React from "react";

export class LinkFactory extends DefaultLinkFactory {
	constructor() {
		super('link');
	}

	generateModel(event: { initialConfig: any }): WorkerLinkModel {
		return new WorkerLinkModel(event.initialConfig.id);
	}

	generateReactWidget(props: { model: WorkerLinkModel }): JSX.Element {
		return <LinkWidget link={props.model} />;
	}
}
