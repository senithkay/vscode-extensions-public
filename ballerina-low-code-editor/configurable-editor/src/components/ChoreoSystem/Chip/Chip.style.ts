/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { alpha, createStyles, makeStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    contained: {
      "&$default": {
        backgroundColor: theme.palette.grey[200],
      },
      "&$error": {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.common.white,
      },
      "&$info": {
        backgroundColor: "#0095ff",
        color: theme.palette.common.white,
      },
      "&$primary": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
      },
      "&$secondary": {
        background: theme.palette.common.white,
      },
      "&$success": {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
      },
      "&$warning": {
        backgroundColor: theme.palette.warning.dark,
        color: theme.palette.common.white,
      },
    },
    default: {},
    error: {},
    info: {},
    large: {
      borderRadius: theme.spacing(0.625),
      fontSize: theme.spacing(1.625),
      lineHeight: 1.23,
      padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
    },
    medium: {
      borderRadius: theme.spacing(0.625),
      fontSize: theme.spacing(1.625),
      height: theme.spacing(3),
      lineHeight: 1.23,
      padding: `${theme.spacing(0.1)}px ${theme.spacing(1)}px`,
    },
    outlined: {
      "&$default": {
        backgroundColor: theme.palette.grey[100],
        border: `1px solid ${theme.palette.grey[200]}`,
      },
      "&$error": {
        backgroundColor: theme.palette.error.light,
        border: `1px solid ${theme.palette.error.main}`,
        color: theme.palette.error.main,
      },
      "&$info": {
        backgroundColor: alpha("#0095ff", 0.1),
        border: "1px solid #0095ff",
        color: "#0095ff",
      },
      "&$primary": {
        backgroundColor: "#f0f1fb",
        border: `1px solid ${theme.palette.primary.main}`,
        color: theme.palette.primary.main,
      },
      "&$secondary": {
        backgroundColor: theme.palette.common.white,
        border: `1px solid ${theme.palette.grey[200]}`,
      },
      "&$success": {
        backgroundColor: theme.palette.success.light,
        border: `1px solid ${theme.palette.success.main}`,
        color: theme.palette.success.main,
      },
      "&$warning": {
        backgroundColor: theme.palette.warning.light,
        border: `1px solid ${theme.palette.warning.dark}`,
        color: theme.palette.warning.dark,
      },
    },
    primary: {},
    root: {
      "& .MuiChip-label": {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    secondary: {},
    small: {
      borderRadius: theme.spacing(0.375),
      fontSize: theme.spacing(1.25),
      height: theme.spacing(2),
      lineHeight: 1.6,
      padding: `${theme.spacing(0)}px ${theme.spacing(0.5)}px`,
    },
    success: {},
    warning: {},
  }),
);
export default useStyles;
