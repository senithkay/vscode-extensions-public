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

import React, { ReactNode } from 'react';

import Typography from '@material-ui/core/Typography';
import { Warning } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import clsx from 'clsx';

import { useStyles } from './style';

export interface WarningBannerProps {
    message: ReactNode | string;
    testId?: string;
    className?: string;
}

export const WarningBanner = (props: WarningBannerProps) => {
    const classes = useStyles();
    const { message, testId, className } = props;

    return (
        <div className={clsx([classes.warningContainer, className])} data-testid="warning-banner">
            <div className={classes.warningIcon}>
                <Warning/>
            </div>
            <div data-test-id={testId} >
                {(typeof message === 'string' ? <Typography variant="body1">{message}</Typography> : (message))}
            </div>
        </div>
    );
};
