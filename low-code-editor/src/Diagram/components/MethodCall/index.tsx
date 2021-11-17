/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useEffect, useState } from "react";

import "./style.scss";

export let METHODCALL_TEXT_WIDTH = 125;

export function MethodCall(props: { x: number, y: number, methodCall: string, key_id: number  }) {
    const { key_id, methodCall, ...xyProps } = props;
    const [textWidth, setTextWidth] = useState(METHODCALL_TEXT_WIDTH);

    useEffect(() => {
        setTextWidth(document.getElementById("textLegnth_" + key_id)?.getBoundingClientRect().width);
    }, []);

    const methodCallMaxWidth = methodCall?.length >= 25;

    return (
        <svg {...xyProps} width="150" height="24" className="method-call-wrapper">
            <g>
                <text
                    className={"method-name"}
                    transform="translate(4 13.5)"
                >
                    <tspan x="0" y="0">{methodCallMaxWidth ? methodCall.slice(0, 26) + "..." : methodCall}</tspan>
                </text>
            </g>
        </svg >
    );
}
