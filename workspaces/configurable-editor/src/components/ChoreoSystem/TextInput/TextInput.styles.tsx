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
  error: {
    background: theme.palette.error.light,
    borderColor: theme.palette.error.main,
    boxShadow: `0 0 0 1px ${theme.palette.error.light}, inset 0 2px 2px ${alpha(theme.palette.error.light, 0.07)}`,
  },
  focused: {
    borderColor: theme.palette.primary.light,
    boxShadow: `0 0 0 1px ${theme.palette.primary.light}, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.07)}`,
  },
  formLabel: {
    alignItems: "center",
    display: "flex",
    marginBottom: theme.spacing(0.5),
    width: "100%",
  },
  formLabelAction: {
    alignItems: "center",
    display: "flex",
    marginLeft: "auto",
  },
  formLabelInfo: {
    alignItems: "center",
    display: "flex",
    marginLeft: theme.spacing(1),
  },
  formLabelTooltip: {
    marginLeft: theme.spacing(1),
  },
  formOptional: {
    color: theme.palette.secondary.main,
    fontSize: theme.spacing(1.4),
  },
  inputGroup: {
    position: "relative",
  },
  multiline: {},
  readOnly: {
    border: "none",
    boxShadow: `0 0 0 1px ${alpha(theme.palette.common.black, 0.05)}, inset 0 2px 2px ${alpha(theme.palette.common.black, 0.05)}`,
  },
  root: {
    "&$multiline": {
      height: "auto",
      resize: "auto",
    },
    "background": theme.palette.common.white,
    "border": `1px solid ${theme.palette.grey[100]}`,
    "borderRadius": 5,
    "boxShadow": `inset 0 2px 2px ${alpha(theme.palette.common.black, 0.07)}`,
    "height": theme.spacing(5),
    "padding": theme.spacing(1.25, 1.5),
    "width": "100%",
  },
  textarea: {
    resize: "both",
  },
  tooltipIcon: {
    color: theme.palette.secondary.main,
    cursor: "help",
    fontSize: theme.spacing(1.75),
  },
}));

export default useTextFiledStyles;
