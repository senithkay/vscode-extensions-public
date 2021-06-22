/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from "react";

export interface CanvasProps {
    children?: React.ReactElement | React.ReactElement[],
    w: number,
    h: number
}

export function Canvas(props: CanvasProps) {
    const { children, w, h } = props;

    return (
        <div>
            <svg
                data-testid="diagram-canvas"
                className="diagram-canvas"
                preserveAspectRatio={"xMinYMin"}
                width={w}
                height={h}
            >
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                        fill="#5567d5"
                    >
                        <polygon points="0 0, 7 3.5, 0 7" />
                    </marker>
                </defs>
                <g>
                    {children}
                </g>
                <g className="diagram-overlay" />
            </svg >
        </div>
    );
};

