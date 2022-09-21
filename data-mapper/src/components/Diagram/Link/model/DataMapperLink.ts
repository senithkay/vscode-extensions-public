import { BezierCurve } from "@projectstorm/geometry";
import { DefaultLinkModel } from "@projectstorm/react-diagrams";
import { STNode } from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

export const LINK_TYPE_ID = "datamapper-link";

export class DataMapperLinkModel extends DefaultLinkModel {

	constructor(public value: STNode = undefined, public diagnostics: Diagnostic[] = []) {
		super({
			type: LINK_TYPE_ID,
			width: 1,
			curvyness: 0,
			locked: true,
			color: "#5567D5"
		});

		if (diagnostics.length > 0){
			this.setColor('#FE523C');
		}

	}

	getSVGPath(): string {
		if (this.points.length == 2) {
			const curve = new BezierCurve();
			curve.setSource(this.getFirstPoint().getPosition());
			curve.setTarget(this.getLastPoint().getPosition());
			const srcControl = this.getFirstPoint().getPosition().clone();
			srcControl.translate(220, 0);
			const targetControl = this.getLastPoint().getPosition().clone();
			targetControl.translate(-220, 0);
			curve.setSourceControl(srcControl);
			curve.setTargetControl(targetControl);

			if (this.sourcePort) {
				curve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
			}

			if (this.targetPort) {
				curve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
			}
			return curve.getSVGCurve();
		}
	}

	public hasError(): boolean {
		return this.diagnostics.length > 0 ;
	}
}
