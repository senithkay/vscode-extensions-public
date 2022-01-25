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

import Button from '@material-ui/core/Button';
import { Theme, withStyles } from '@material-ui/core/styles';

const DefaultButtonSquare = withStyles((theme: Theme) => ({
  root: {
    paddingLeft: theme.spacing(0.1),
    paddingRight: theme.spacing(0.1),
    paddingBottom: theme.spacing(0.5),
    paddingTop: theme.spacing(0.5),
    fontSize: theme.spacing(1.2),
  },
}))(Button) as typeof Button;

export default DefaultButtonSquare;
