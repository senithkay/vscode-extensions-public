import * as React from 'react';
import { RightAngleLinkWidget } from './RightAngleLinkWidget';
import { RightAngleLinkModel } from './RightAngleLinkModel';
import { container, injectable, singleton } from "tsyringe";
import { DefaultLinkFactory } from '@projectstorm/react-diagrams';


@injectable()
@singleton()
export class RightAngleLinkFactory extends DefaultLinkFactory<RightAngleLinkModel> {
	static NAME = 'rightAngle';

	constructor() {
		super(RightAngleLinkFactory.NAME);
	}

	generateModel(): RightAngleLinkModel {
		return new RightAngleLinkModel();
	}

	generateReactWidget(event: any): JSX.Element {
		return <RightAngleLinkWidget diagramEngine={this.engine} link={event.model} factory={this} />;
	}
}
container.register("LinkFactory", { useClass: RightAngleLinkFactory });
