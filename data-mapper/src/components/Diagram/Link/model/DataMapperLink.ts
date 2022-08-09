import { DefaultLinkModel } from "@projectstorm/react-diagrams";
import { BezierCurve } from "@projectstorm/geometry";
import { FieldAccess, NodePosition, SimpleNameReference } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { isNodeInRange } from "../../utils/ls-utils";


export const LINK_TYPE_ID = "datamapper-link";

export class DataMapperLinkModel extends DefaultLinkModel {
	public hasError: boolean

	constructor(public value: SimpleNameReference|FieldAccess = undefined, public diagnostics: Diagnostic[] = []) {
		super({
			type: LINK_TYPE_ID,
			width: 1,
			curvyness: 0,
			locked: true,
			color: "#5567D5"
		});

		this.hasError = diagnostics.length > 0;
		if (this.hasError){
			this.setColor('red');
		}

	}

	getSVGPath(): string {
		if (this.points.length == 2) {
			const curve = new BezierCurve();
			curve.setSource(this.getFirstPoint().getPosition());
			curve.setTarget(this.getLastPoint().getPosition());
			curve.setSourceControl(this.getFirstPoint().getPosition().clone());
			curve.setTargetControl(this.getLastPoint().getPosition().clone());

			if (this.sourcePort) {
				curve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			}

			if (this.targetPort) {
				curve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
			}
			return curve.getSVGCurve();
		}
	}
}
