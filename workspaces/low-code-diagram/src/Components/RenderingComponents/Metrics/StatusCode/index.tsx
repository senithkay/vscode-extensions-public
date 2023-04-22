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
import * as React from "react";

import "../style.scss"

import { ConnectionErrorSVG } from "./ConnectionErrorSVG";
import { ConnectionFailedSVG } from "./ConnectionFailedSVG";
import { ConnectionSuccessSVG } from "./ConnectionSuccessSVG";

export interface StatusCodeProps {
    x: number,
    y: number,
    httpStatusCode: string
    errorStatus: string
    errorMsg: string
}

export function StatusCodeC(props: StatusCodeProps) {
    const { x, y, httpStatusCode, errorStatus, errorMsg } = props;
    if (httpStatusCode === "") {
        return errorStatus !== "false" ? <ConnectionErrorSVG x={x} y={y} text={"Failure"} errorMsg={errorMsg} /> : <ConnectionSuccessSVG x={x} y={y} text={"Success"} />
    }
    const statusMsg = httpStatusCode.charAt(0) === '2' ? <ConnectionSuccessSVG x={x} y={y} text={httpStatusCode}/> : <ConnectionFailedSVG x={x} y={y} text={httpStatusCode}/>

    if (errorStatus !== "false"){
        return (
            <g>
                <ConnectionErrorSVG x={x} y={y} text={"ERROR"} errorMsg={errorMsg}/>
            </g>
        );
    }else{
        return (
            <g>
                {statusMsg}
            </g>
        );
    }
}

export const StatusCode = StatusCodeC;
