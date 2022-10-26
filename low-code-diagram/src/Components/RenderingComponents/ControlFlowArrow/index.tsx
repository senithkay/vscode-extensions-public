import React from 'react'

import { ControlFLowArrowSVG } from './ControlFLowArrowSVG';
import "./style.scss";

export interface ControlFlowArrowProps {
    x: number;
    y: number;
    w: number;
    h?: number;
    isDotted: boolean;
    isTurnArrow?: boolean;
}

export default function ControlFlowArrow(props: ControlFlowArrowProps) {
    const { isDotted, isTurnArrow, x, w, y, h } = props;
    return (
        <g className="control-flow-line-expand">
            <ControlFLowArrowSVG
                x1={x + w}
                x2={x}
                y={y}
                h={h}
                w={w}
                isDotted={isDotted}
                isTurnArrow={isTurnArrow}
            />
        </g>
    );
}
