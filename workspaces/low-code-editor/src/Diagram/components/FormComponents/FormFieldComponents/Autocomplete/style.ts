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

import { createStyles, makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(() =>
  createStyles({
    root: {
      backgroundColor: "#fff",
      borderRadius: 5,
      boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
      height: 35,
      maxWidth: 300,
    },
    inputRoot: {
      backgroundColor: "#fff",
      borderRadius: 5,
      boxShadow: 'inset 0 0 0 1px #DEE0E7, inset 0 2px 1px 0 rgba(0,0,0,0.07), 0 0 0 0 rgba(50,50,77,0.07)',
      height: 35,
      maxWidth: 300,
      padding: "1px !important",
      '& fieldset.MuiOutlinedInput-notchedOutline': {
        display: "none",
      }
    },
    input: {
      padding: "9px !important",
      marginLeft: 12
    },
    titleLabel: {
      padding: 0,
      color: '#1D2028',
      fontSize: 14,
      lineHeight: '40px',
      display: 'inline-block',
    },
    titleLabelRequired: {
      padding: 0,
      color: '#DC143C',
      fontSize: "13px",
      textTransform: 'capitalize',
      display: 'inline-block',
      paddingTop: '0.25rem'
    }
  })
);
