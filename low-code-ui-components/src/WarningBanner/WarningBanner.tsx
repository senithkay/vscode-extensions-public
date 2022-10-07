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

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { useStyles } from './style';

export interface WarningBannerProps {
  message: ReactNode | string;
  testId: string;
}

export const WarningBanner = (props: WarningBannerProps) => {
    const classes = useStyles();
    const { message, testId } = props;

    return (
        <Box className={classes.warningContainer} data-testid="warning-banner">
            <Box display="flex" flexDirection="row">
                <Box display="flex" flexDirection="row" ml={1} data-testid={testId}>
                    <Typography variant="body1">{message}</Typography>
                </Box>
                <Box display="flex" ml={1} mr={1} pl={2}>
                    <img src="/images/warning_orange_filled.svg" alt="" width={16}/>
                </Box>
            </Box>
        </Box>
    );
};
