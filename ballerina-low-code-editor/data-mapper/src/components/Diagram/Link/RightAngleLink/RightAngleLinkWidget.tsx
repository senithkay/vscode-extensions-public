import * as React from 'react';
import { DiagramEngine, LinkWidget, PointModel } from '@projectstorm/react-diagrams-core';
import { RightAngleLinkFactory } from './RightAngleLinkFactory';
import { Point } from '@projectstorm/geometry';
import { RightAngleLinkModel } from './RightAngleLinkModel';

export interface RightAngleLinkProps {
	color?: string;
	width?: number;
	smooth?: boolean;
	link: RightAngleLinkModel;
	diagramEngine: DiagramEngine;
	factory: RightAngleLinkFactory;
}

export interface RightAngleLinkState {}

export class RightAngleLinkWidget extends React.Component<RightAngleLinkProps, RightAngleLinkState> {
	public static defaultProps: RightAngleLinkProps = {
		color: '#CBCEDB',
		width: 2,
		link: null,
		smooth: false,
		diagramEngine: null,
		factory: null
	};

	refPaths: React.RefObject<SVGPathElement>[];

	// DOM references to the label and paths (if label is given), used to calculate dynamic positioning
	refLabels: { [id: string]: HTMLElement };

	constructor(props: RightAngleLinkProps) {
		super(props);
		this.refPaths = [];
	}

	componentDidUpdate(): void {
		this.props.link.setRenderedPaths(
			this.refPaths.map((ref) => {
				return ref.current;
			})
		);
	}

	componentDidMount(): void {
		this.props.link.setRenderedPaths(
			this.refPaths.map((ref) => {
				return ref.current;
			})
		);
	}

	componentWillUnmount(): void {
		this.props.link.setRenderedPaths([]);
	}

	generateLink(path: string, extraProps: any, id: string | number): JSX.Element {
		const ref = React.createRef<SVGPathElement>();
		this.refPaths.push(ref);

		const Link = React.cloneElement(
            this.props.factory.generateLinkSegment(this.props.link, false, path),
            {
				key:`right-angle-link-${id}`,
                ref,
                stroke: RightAngleLinkWidget.defaultProps.color,
                strokeWidth: RightAngleLinkWidget.defaultProps.width,
                cursor: "inherit",
				...extraProps
            }
        );

        return Link;
	}

	render() {
		//ensure id is present for all points on the path
		let points = this.props.link.getPoints();
		let paths = [];

		// Get points based on link orientation
		let pointLeft = points[0];
		let pointRight = points[points.length - 1];
		if (pointLeft.getX() > pointRight.getX()) {
			pointLeft = points[points.length - 1];
			pointRight = points[0];
		}
		let dy = Math.abs(points[0].getY() - points[points.length - 1].getY());

		// If there is existing link which has two points add one
		// NOTE: It doesn't matter if check is for dy or dx
		if (points.length === 2 && dy !== 0) {
			this.props.link.addPoint(
				new PointModel({
					link: this.props.link,
					position: new Point(pointLeft.getX(), pointRight.getY())
				})
			);
		}

		for (let j = 0; j < points.length - 1; j++) {
			paths.push(
				this.generateLink(
					LinkWidget.generateLinePath(points[j], points[j + 1]),
					{
						'data-linkid': this.props.link.getID(),
						'data-point': j,
					},
					j
				)
			);
		}

		this.refPaths = [];
		return <g data-default-link-test={this.props.link.getOptions().testName}>{paths}</g>;
	}
}
