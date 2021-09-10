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

import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import DisableDigramIcon from "../../../../assets/icons/DisableDigram";

const LightTooltip = withStyles((theme) => ({
    tooltip: {
      backgroundColor: 'rgba(235, 236, 241, 0.6)',
      color: theme.palette.common.black,
      boxShadow: theme.shadows[0],
      fontSize: 14,
      padding: '8px 30px',
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      marginLeft: -60
    },
    popperInteractive: {
        padding: '5px',
        left: '25px !important'
    }
  }))(Tooltip);

export function DiagramDisableState() {
    return (
            <LightTooltip title="Diagram is inactive" interactive={true} placement='right'>
                <DisableDigramIcon />
            </LightTooltip>
    );
}
