/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import {
    CallerIcon,
    QueryIcon,
    SegmentIcon,
    ParamIcon,
    PayloadIcon,
    RequestIcon
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';

export interface Props {
    option: string;
}

export function ParamIcons(props: Props) {
    if (props?.option === "Query") {
        return <QueryIcon />;
    } else if (props?.option === "Segment") {
        return <SegmentIcon />;
    } else if (props?.option === "Parameter") {
        return <ParamIcon />;
    } else if (props?.option === "Payload") {
        return <PayloadIcon />;
    } else if (props?.option === "Request") {
        return <RequestIcon />;
    } else if (props?.option === "Caller") {
        return <CallerIcon />;
    }
    return null;
}
