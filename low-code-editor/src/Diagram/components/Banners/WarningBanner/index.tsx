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

import React, { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

import { useStyles } from './style';

export interface WarningBannerProps {
  title?: ReactNode | string;
  message: ReactNode | string;
}

export const WarningBanner = (props: WarningBannerProps) => {
  const classes = useStyles();
  const { message } = props;

  return (
    <div className={classes.warningContainer} data-testid="warning-banner">
      <Box display="flex" flexDirection="column" justifyContent="space-between">
        <Box display="flex" flexDirection="row" mr={1}>
          <Box justifyContent="center">
            <Typography variant="h5" data-testid="warning-title">
              <FormattedMessage
                id="pages.Projects.Project.ProjectComponent.Manage.PublishToMarketplace.WarningBanner.warning.title"
                defaultMessage="Warning"
              />
            </Typography>
          </Box>
          <Box display="flex" ml="auto">
            <img src="/images/info-orange.svg" alt="" />
          </Box>
        </Box>
        <Box mt={1} data-testid="warning-text">
          <Typography variant="body1">{message}</Typography>
        </Box>
      </Box>
    </div>
  );
};

export default WarningBanner;
