import React from "react";

import { DefaultLinkFactory } from "@projectstorm/react-diagrams";

import { DataMapperLinkModel, LINK_TYPE_ID } from "./DataMapperLink";
import { DefaultLinkWidget } from "./DefaultLinkWidget";

export class DataMapperLinkFactory extends DefaultLinkFactory {
    constructor() {
        super(LINK_TYPE_ID);
    }

    generateModel(): DataMapperLinkModel {
        return new DataMapperLinkModel();
    }

    generateReactWidget(event: { model: DataMapperLinkModel }): JSX.Element {
        return (
            <DefaultLinkWidget link={event.model} diagramEngine={this.engine} />
        );
    }
}
