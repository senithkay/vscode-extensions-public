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
import React from "react";

import { TooltipIcon } from "../../Tooltip";

import { useStyles } from "./styles";

export default function ConfigPanelSection(props: any) {
    const classes = useStyles();
    const { title, tooltip, children } = props;

    return (
        <div className={classes.sectionWrapper}>
            { !!tooltip ? (
                <TooltipIcon
                    title={tooltip.title}
                    placement="left"
                    arrow={true}
                    codeSnippet={true}
                    example={true}
                    content={tooltip.content}
                >
                    <p className={classes.sectionTitle}>{title}</p>
                </TooltipIcon>

            ) :
                (<p className={classes.sectionTitle}>{title}</p>)
            }
            {children}
        </div>
    );
}
