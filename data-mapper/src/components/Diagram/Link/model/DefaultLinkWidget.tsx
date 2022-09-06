import * as React from "react";
import { DefaultLinkSegmentWidget } from "./DefaultLinkSegmentWidget";
import { DefaultLinkWidget as ReactDiagramDefaultLinkWidget } from "@projectstorm/react-diagrams";

export class DefaultLinkWidget extends ReactDiagramDefaultLinkWidget {
    generateLink(
        path: string,
        extraProps: any,
        id: string | number
    ): JSX.Element {
        const ref = React.createRef<SVGPathElement>();
        this.refPaths.push(ref);
        return (
            <DefaultLinkSegmentWidget
                key={`link-${id}`}
                path={path}
                selected={this.state.selected}
                diagramEngine={this.props.diagramEngine}
                factory={this.props.diagramEngine.getFactoryForLink(
                    this.props.link
                )}
                link={this.props.link}
                forwardRef={ref}
                onSelection={(selected) => {
                    this.setState({ selected: selected });
                }}
                extras={extraProps}
            />
        );
    }
}
