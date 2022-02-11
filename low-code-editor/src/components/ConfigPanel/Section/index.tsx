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

import { Grid, Typography } from "@material-ui/core";
import { TooltipIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStyles } from "./styles";

export default function ConfigPanelSection(props: any) {
    const classes = useStyles();
    const { title, tooltip, children, tooltipWithExample, tooltipWithListView, button } = props;

    const switchBtn = (
        <div className={classes.switch}>
            {button}
        </div>
    )

    return (
        <div className={classes.sectionWrapper}>
            <Grid container={true} spacing={1}>
                    <Grid item={true} xs={12}>
                        {!!tooltipWithListView ? (
                            <TooltipIcon
                                title={tooltipWithListView.title}
                                placement="left"
                                arrow={true}
                            >
                                <div className={classes.titleContent}>
                                    <p className={classes.sectionTitle}>{title}</p>
                                    {button && switchBtn}
                                </div>
                            </TooltipIcon>

                        ) : (!!tooltipWithExample) ? (
                            <TooltipIcon
                                title={tooltipWithExample.title}
                                placement="left"
                                arrow={true}
                                codeSnippet={true}
                                example={true}
                                content={tooltipWithExample.content}
                            >
                                <div className={classes.titleContent}>
                                    <p className={classes.sectionTitle}>{title}</p>
                                    {button && switchBtn}
                                </div>
                            </TooltipIcon>

                        ) : (!!tooltip?.title || !!tooltip) ? (
                            <TooltipIcon
                                title={tooltip?.title || tooltip}
                                placement="left"
                                arrow={true}
                            >
                                <div className={classes.titleContent}>
                                    <p className={classes.sectionTitle}>{title}</p>
                                    {button && switchBtn}
                                </div>
                            </TooltipIcon>
                        ) : (
                            <div className={classes.titleContent}>
                                <p className={classes.sectionTitle}>{title}</p>
                                {button && switchBtn}
                            </div>
                        )
                        }
                    </Grid>
            </Grid>
            {children}
        </div>
    );
}
