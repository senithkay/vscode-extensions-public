import { DefaultPortModel, LinkModel } from "@projectstorm/react-diagrams";
import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { RightAngleLinkModel } from "../../Link";

export class RightAnglePortModel extends DefaultPortModel {
	createLinkModel(factory?: AbstractModelFactory<LinkModel>) {
		return new RightAngleLinkModel();
	}
}