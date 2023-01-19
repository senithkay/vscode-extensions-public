import React from "react";

import { DefaultLinkFactory } from "@projectstorm/react-diagrams";

import { GraphqlServiceLinkModel } from "./GraphqlServiceLinkModel";
import { GraphqlServiceLinkWidget } from "./GraphqlServiceLinkWidget";

export class GraphqlServiceLinkFactory extends DefaultLinkFactory {
    constructor() {
        super('graphqlServiceLink');
    }

    generateModel(event: { initialConfig: any }): GraphqlServiceLinkModel {
        return new GraphqlServiceLinkModel(event.initialConfig.functionType);
    }

    generateReactWidget(event: { model: GraphqlServiceLinkModel }): JSX.Element {
        return <GraphqlServiceLinkWidget link={event.model} engine={this.engine} />;
    }
}
