// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-no-lambda
import React, { useEffect, useState } from "react";

import { DiagramEngine } from "@projectstorm/react-diagrams";

import { GRAPHQL_SERVICE_NODE } from "../../Nodes/GraphqlServiceNode/GraphqlServiceNodeModel";
import { Colors, RemoteFunction, ResourceFunction } from "../../resources/model";

import { GraphqlServiceLinkModel } from "./GraphqlServiceLinkModel";
import { findCallingFunction } from "./link-utils";

interface WidgetProps {
    engine: DiagramEngine,
    link: GraphqlServiceLinkModel
}

export function GraphqlServiceLinkWidget(props: WidgetProps) {
    const { link, engine } = props;

    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [anchorElement, setAnchorElement] = useState<SVGPathElement | HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: undefined, y: undefined });
    const [callingFunction, setCallingFunction] = useState<ResourceFunction | RemoteFunction>(undefined);


    useEffect(() => {
        link.initLinks(engine);

        link.registerListener({
            'SELECT': selectPath,
            'UNSELECT': unselectPath
        })

        if (link.getTargetPort().getNode().getType() === GRAPHQL_SERVICE_NODE) {
            setCallingFunction(findCallingFunction(link.getTargetPort()));
        }
    }, [link]);

    const onMouseOver = (event: React.MouseEvent<SVGPathElement | HTMLDivElement>) => {
        if (callingFunction) {
            setAnchorElement(event.currentTarget);
        }
        selectPath();
    }

    const onMouseLeave = () => {
        if (callingFunction) {
            setAnchorElement(null);
        }
        unselectPath();
    }

    const selectPath = () => {
        link.selectLinkedNodes();
        setIsSelected(true);
    }

    const unselectPath = () => {
        link.resetLinkedNodes();
        setIsSelected(false);
    }



    return(
        <g>
            <polygon
                points={link.getArrowHeadPoints()}
                fill={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
            />

            <path
                id={link.getID()}
                cursor={'pointer'}
                d={link.getCurvePath()}
                fill='none'
                pointerEvents='all'
                onMouseLeave={onMouseLeave}
                onMouseMove={e => callingFunction ? setPosition({ x: e.pageX, y: e.pageY }) : {}}
                onMouseOver={onMouseOver}
                stroke={isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}
                strokeWidth={1}
            />
        </g>
    );
}
