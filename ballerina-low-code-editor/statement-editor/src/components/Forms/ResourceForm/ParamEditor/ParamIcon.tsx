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
    HeaderIcon,
    PayloadIcon,
    QueryIcon,
    RequestIcon
} from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { PARAM_TYPES } from "./ParamEditor";

export interface Props {
    option: string;
}


export function ParamIcons(props: {type: string}): JSX.Element {
    switch (props.type) {
        case PARAM_TYPES.DEFAULT:
            return <QueryIcon />;
        case PARAM_TYPES.PAYLOAD:
            return <PayloadIcon />;
        case PARAM_TYPES.REQUEST:
            return <RequestIcon />;
        case PARAM_TYPES.CALLER:
            return <CallerIcon />;
        case PARAM_TYPES.HEADER:
            return <HeaderIcon />;
        default:
            return <></>;
    }
}
