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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";
import { SourcePointViewState } from "../../viewstate";

export const EXPRESSION_BOX_SVG_HEIGHT = 29;
export const EXPRESSION_BOX_SVG_WIDTH = 29;

export function ExpressionBoxSVG(props: { x: number, y: number, onClick: () => void }) {
    const { onClick, ...xyProps } = props;
    return (
        <svg {...xyProps} height={EXPRESSION_BOX_SVG_HEIGHT} width={EXPRESSION_BOX_SVG_WIDTH} onClick={onClick} >
            <g id="Button_Primary_Square_Click" transform="translate(2.5 2.5)">
                <g id="State">
                    <rect id="Rectangle" width="28" height="28" rx="5" fill="#fff" stroke="#dee0e7" stroke-width="1" />
                </g>
                <g id="Icon_Wrapper" transform="translate(6 6)">
                    <g id="Group_8" transform="translate(-0.002 2.667)">
                        <path
                            id="Combined_Shape-2"
                            d="M10.047,10.407l-.006-.006a.889.889,0,0,1,0-1.26l3.822-3.807L10.041,1.526a.889.889,0,0,1,
                        0-1.26l.006-.006a.889.889,0,0,1,1.255,0l4.439,4.422a.944.944,0,0,1,0,1.3L11.3,
                        10.407a.889.889,0,0,1-1.255,0Zm-5.346,0L.262,5.986a.944.944,0,0,1,0-1.3L4.7.259a.889.889,
                        0,0,1,1.255,0l.006.006a.889.889,0,0,1,0,1.26L2.14,5.334,5.963,9.141a.889.889,0,0,1,0,
                        1.26l-.006.006a.889.889,0,0,1-1.255,0Z"
                            transform="translate(0 0)"
                            fill="#8d91a3"
                        />
                    </g>
                </g>
            </g>
        </svg>
    )
}
