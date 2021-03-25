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
import React from 'react';

import { SourcePointViewState, TargetPointViewState } from "../../viewstate";

interface DataPointProps {
    dataPointViewState: SourcePointViewState | TargetPointViewState;
}

export function DataPoint(props: DataPointProps) {
    const { dataPointViewState } = props;

    const connections: JSX.Element[] = [];

    if (dataPointViewState instanceof SourcePointViewState) {
        (dataPointViewState as SourcePointViewState).connections.forEach(connection => {
            connections.push(<line x1={connection.x1} x2={connection.x2} y1={connection.y1} y2={connection.y2} style={{ stroke: 'rgb(255,0,0)', strokeWidth: 2 }} />)
        })
    }

    return (
        <>
            {connections}
        </>
    )
}
