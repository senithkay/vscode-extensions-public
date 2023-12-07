import { BezierCurve, Point } from "@projectstorm/geometry";
import { PortModelAlignment } from "@projectstorm/react-diagrams";
import { DefaultLinkModel } from "@projectstorm/react-diagrams-defaults";

export class AdvanceLinkModel extends DefaultLinkModel {
    constructor(id: string, type: string) {
        super({
            id: id,
            type: type,
        });
    }

    getCurvePath = (): string => {
        const lineCurve = new BezierCurve();

        if (this.getSourcePort() && this.getTargetPort()) {
            let markerSpace: number = this.getType() === "link" ? 40 : 72;

            lineCurve.setSource(this.getSourcePort().getPosition());
            lineCurve.setTarget(this.getTargetPort().getPosition());

            // With a leeway space for the marker
            let sourcePoint: Point = this.getSourcePort().getPosition().clone();
            let targetPoint: Point = this.getTargetPort().getPosition().clone();

            if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
                targetPoint.x = targetPoint.x - markerSpace;
            } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
                targetPoint.x = targetPoint.x + markerSpace;
            } else {
                targetPoint.y = targetPoint.y + 150;
            }

            if (this.getSourcePort().getOptions().alignment === PortModelAlignment.LEFT) {
                sourcePoint.x = sourcePoint.x - markerSpace;
            } else if (this.getSourcePort().getOptions().alignment === PortModelAlignment.RIGHT) {
                sourcePoint.x = sourcePoint.x + markerSpace / 2;
            } else {
                sourcePoint.y = sourcePoint.y - 90;
            }

            lineCurve.setSourceControl(sourcePoint);
            lineCurve.setTargetControl(targetPoint);
            lineCurve.getSourceControl().translate(...this.calculateControlOffset(this.getSourcePort()));
            lineCurve.getTargetControl().translate(...this.calculateControlOffset(this.getTargetPort()));
        }

        return lineCurve.getSVGCurve();
    };

    getArrowHeadPoints = (): string => {
        let points: string;
        let targetPort: Point = this.getTargetPort().getPosition();

        if (this.getTargetPort().getOptions().alignment === PortModelAlignment.RIGHT) {
            points = `${targetPort.x + 2} ${targetPort.y}, ${targetPort.x + 12} ${targetPort.y + 6},
				${targetPort.x + 12} ${targetPort.y - 6}`;
        } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.LEFT) {
            points = `${targetPort.x} ${targetPort.y}, ${targetPort.x - 10} ${targetPort.y + 6},
				${targetPort.x - 10} ${targetPort.y - 6}`;
        } else if (this.getTargetPort().getOptions().alignment === PortModelAlignment.BOTTOM) {
            points = `${targetPort.x} ${targetPort.y + 2}, ${targetPort.x + 10} ${targetPort.y + 14},
				${targetPort.x - 10} ${targetPort.y + 14}`;
        }
        return points;
    };
}