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

import { alpha, makeStyles } from "@material-ui/core";

export const useTextFiledStyles = makeStyles((theme) => ({
  root: {
    "padding": theme.spacing(1.25, 1.5),
    "width": "100%",
    "height": theme.spacing(5),
    "background": theme.palette.common.white,
    "border": `1px solid ${theme.palette.grey[100]}`,
    "boxShadow": `inset 0 2px 2px ${alpha(theme.palette.common.black, 0.07)}`,
    "borderRadius": 5,
    "&$multiline": {
      height: "auto",
      resize: "auto",
    },
  },
  multiline: {},
  focused: {
    borderColor: theme.palette.primary.light,
    boxShadow: `0 0 0 1px ${
      theme.palette.primary.light
    }, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.07)}`,
  },
  error: {
    background: theme.palette.error.light,
    borderColor: theme.palette.error.main,
    boxShadow: `0 0 0 1px ${theme.palette.error.light}, inset 0 2px 2px ${alpha(
      theme.palette.error.light,
      0.07,
    )}`,
  },
  readOnly: {
    boxShadow: `0 0 0 1px ${alpha(
      theme.palette.common.black,
      0.05,
    )}, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.05)}`,
    border: "none",
  },
  formLabel: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    marginBottom: theme.spacing(0.5),
  },
  formLabelAction: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
  },
  formLabelInfo: {
    marginLeft: theme.spacing(1),
    display: "flex",
    alignItems: "center",
  },
  formOptional: {
    color: theme.palette.secondary.main,
    fontSize: theme.spacing(1.4),
  },
  formLabelTooltip: {
    marginLeft: theme.spacing(1),
  },
  inputGroup: {
    position: "relative",
  },
  tooltipIcon: {
    color: theme.palette.secondary.main,
    cursor: "help",
    fontSize: theme.spacing(1.75),
  },
  textarea: {
    resize: "both",
  },
}));

export default useTextFiledStyles;
