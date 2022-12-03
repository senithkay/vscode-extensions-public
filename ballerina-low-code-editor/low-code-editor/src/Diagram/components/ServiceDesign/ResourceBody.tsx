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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import HomeIcon from '@material-ui/icons/Home';
import CloseIcon from '@material-ui/icons/Close';

import classNames from "classnames";


import { useStyles } from "./style";
import { ResourceAccessorDefinition } from "@wso2-enterprise/syntax-tree";
import { ResourceHeader } from "./ResourceHeader";

export interface ResourceBodyProps {
    model: ResourceAccessorDefinition;
}

export function ResourceBody(props: ResourceBodyProps) {
    const { model } = props;
    const classes = useStyles();

    const [isExpanded, setIsExpanded] = useState(false);

    const handleIsExpand =  () => {
        setIsExpanded(!isExpanded)
    }
    const body = (
        <div className="service-member">
            <div>
                Parameters
            </div>

            <div>
                Body
            </div>

            <div>
                Response
            </div>
        </div>
    )

    return (
        <div className={classNames("function-box", model.functionName.value)}>
            <ResourceHeader isExpanded={isExpanded} onExpandClick={handleIsExpand} model={model} />
            {isExpanded && body}
        </div>
    );
}
