import { DefaultLinkFactory } from "@projectstorm/react-diagrams";
import React from "react";
import { DataMapperLinkModel, LINK_TYPE_ID } from "./DataMapperLink";
import { container, injectable, singleton } from "tsyringe";
import { DefaultLinkWidget } from "./DefaultLinkWidget";

@injectable()
@singleton()
export class DataMapperLinkFactory extends DefaultLinkFactory {
    constructor() {
        super(LINK_TYPE_ID);
    }

    generateModel(): DataMapperLinkModel {
        return new DataMapperLinkModel();
    }

    generateReactWidget(event: { model: any }): JSX.Element {
        return (
            <DefaultLinkWidget link={event.model} diagramEngine={this.engine} />
        );
    }
}
container.register("LinkFactory", { useClass: DataMapperLinkFactory });
