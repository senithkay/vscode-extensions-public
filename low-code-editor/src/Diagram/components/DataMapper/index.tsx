import React from 'react';
import { connect } from 'react-redux';

import { PortalState } from '../../../../../store';
import { DiagramOverlay, DiagramOverlayContainer } from '../Portals/Overlay';

interface DataMapperProps {
    targetPosition: any;
    width: number;
}

export function DataMapperC(props: DataMapperProps) {
    const { targetPosition, width } = props;

    return (
        <>
            <g>
                <line x1={10} x2={100} y1={15} y2={100} style={{stroke: 'rgb(255,0,0)', strokeWidth: 2}} />
            </g>
            <DiagramOverlayContainer>
                <DiagramOverlay
                    position={{ x: 50, y: 15 }}
                >
                    <div style={{width, height: 50}}>haah</div>
                </DiagramOverlay>
            </DiagramOverlayContainer>
        </>
    )
}

const mapStateToProps = ({ diagramState }: PortalState) => {
    const { targetPosition } = diagramState;

    return {
        targetPosition
    }
};

export const DataMapper = connect(mapStateToProps)(DataMapperC);
