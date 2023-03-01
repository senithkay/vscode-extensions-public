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

export const useButtonStyles = makeStyles((theme: Theme) =>
    createStyles({
      commons: {
        "&$disabled": {
          color: theme.palette.common.white,
        },
        "borderRadius": 5,
        "boxShadow": `0 1px 2px  ${alpha(theme.palette.common.black, 0.15)}`,
        "color": theme.palette.common.white,
        "fontSize": theme.spacing(1.625),
        "fontWeight": 400,
        "gap": theme.spacing(1),
        "lineHeight": `${theme.spacing(3)}px`,
        "padding": theme.spacing(0.875, 2),
      },
      contained: {
        "&:focus": {
          boxShadow: `0 1px 6px 2px ${alpha(theme.palette.common.black, 0.1)}`,
        },
        "&:hover": {
          boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.18)}`,
        },
        "border": `1px solid transparent`,
      },
      disabled: {
        "&:hover": {
          textDecoration: "none",
        },
        "color": theme.palette.common.white,
        "cursor": "default",
        "opacity": 0.5,
        "pointerEvents": "none",
      },
      endIcon: {
        "& *:first-child": {
          fontSize: theme.spacing(2),
        },
      },
      endIconSmall: {
        "& *:first-child": {
          fontSize: theme.spacing(1.75),
        },
      },
      endIconTiny: {
        "& *:first-child": {
          fontSize: theme.spacing(1.5),
        },
      },
      errorContained: {
        "&:hover": {
          backgroundColor: theme.palette.error.dark,
          borderColor: theme.palette.error.dark,
        },
        "backgroundColor": theme.palette.error.main,
        "borderColor": theme.palette.error.main,
      },
      errorOutlined: {
        "&$disabled": {
          color: theme.palette.error.main,
        },
        "&:hover": {
          borderColor: theme.palette.error.dark,
        },
        "backgroundColor": theme.palette.common.white,
        "border": `1px solid ${theme.palette.error.main}`,
        "color": theme.palette.error.main,
      },
      errorSubtle: {
        "&$disabled": {
          color: theme.palette.error.main,
        },
        "color": theme.palette.error.main,
      },
      errorText: {
        "&$disabled": {
          color: theme.palette.error.main,
        },
        "color": theme.palette.error.main,
      },
      fullWidth: {
        width: "100%",
      },
      outlined: {
        "&:hover, &:focus": {
          backgroundColor: "transparent",
          boxShadow: `0 1px 6px 2px ${alpha(theme.palette.common.black, 0.1)}`,
        },
        "boxShadow": `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
      },
      pill: {
        borderRadius: theme.spacing(3.125),
      },
      primaryContained: {
        "&:hover": {
          backgroundColor: theme.palette.primary.dark,
          borderColor: theme.palette.primary.dark,
        },
        "backgroundColor": theme.palette.primary.main,
        "borderColor": theme.palette.primary.main,
      },
      primaryOutlined: {
        "&$disabled": {
          color: theme.palette.primary.main,
        },
        "backgroundColor": theme.palette.common.white,
        "border": `1px solid ${theme.palette.primary.main}`,
        "boxShadow": `0 1px 2px  ${alpha(theme.palette.common.black, 0.05)}`,
        "color": theme.palette.primary.main,
      },
      primarySubtle: {
        "&$disabled": {
          color: theme.palette.primary.main,
        },
        "color": theme.palette.primary.main,
      },
      primaryText: {
        "&$disabled": {
          color: theme.palette.primary.main,
        },
        "color": theme.palette.primary.main,
      },
      secondaryContained: {
        "&$disabled": {
          color: theme.palette.common.black,
        },
        "backgroundColor": theme.palette.secondary.light,
        "border": `1px solid ${theme.palette.grey[100]}`,
        "boxShadow": `0 1px 2px ${alpha(theme.palette.common.black, 0.05)}`,
        "color": theme.palette.common.black,
      },
      secondaryOutlined: {
        "&$disabled": {
          color: theme.palette.secondary.main,
        },
        "&:hover": {
          borderColor: theme.palette.secondary.dark,
        },
        "backgroundColor": theme.palette.common.white,
        "border": `1px solid ${theme.palette.secondary.main}`,
        "color": theme.palette.secondary.main,
      },
      secondarySubtle: {
        "&$disabled": {
          color: theme.palette.common.black,
        },
        "color": theme.palette.common.black,
      },
      secondaryText: {
        "&$disabled": {
          color: theme.palette.common.black,
        },
        "color": theme.palette.common.black,
      },
      small: {
        gap: theme.spacing(0.75),
        padding: theme.spacing(0.375, 2),
      },
      smallPill: {},
      startIcon: {
        "& *:first-child": {
          fontSize: theme.spacing(2),
        },
      },
      startIconSmall: {
        "& *:first-child": {
          fontSize: theme.spacing(1.75),
        },
      },
      startIconTiny: {
        "& *:first-child": {
          fontSize: theme.spacing(1.5),
        },
      },
      subtle: {
        "&:hover, &:focus": {
          backgroundColor: "transparent",
          boxShadow: `0 1px 6px 2px ${alpha(theme.palette.common.black, 0.1)}`,
        },
        "border": `1px solid ${theme.palette.grey[100]}`,
        "boxShadow": `0 1px 3px ${alpha(theme.palette.common.black, 0.05)}`,
      },
      successContained: {
        "&:hover": {
          backgroundColor: theme.palette.success.dark,
          borderColor: theme.palette.success.dark,
        },
        "backgroundColor": theme.palette.success.main,
        "borderColor": theme.palette.success.main,
      },
      successOutlined: {
        "&$disabled": {
          color: theme.palette.success.main,
        },
        "&:hover": {
          borderColor: theme.palette.success.dark,
        },
        "backgroundColor": theme.palette.common.white,
        "border": `1px solid ${theme.palette.success.main}`,
        "color": theme.palette.success.main,
      },
      successSubtle: {
        "&$disabled": {
          color: theme.palette.success.main,
        },
        "color": theme.palette.success.main,
      },
      successText: {
        "&$disabled": {
          color: theme.palette.success.main,
        },
        "color": theme.palette.success.main,
      },
      text: {
        border: "none",
        boxShadow: "none",
      },
      tiny: {
        gap: theme.spacing(0.5),
        padding: theme.spacing(0, 1.5),
      },
      tinyPill: {},
      warningContained: {
        "&:hover": {
          backgroundColor: theme.palette.warning.dark,
          borderColor: theme.palette.warning.dark,
        },
        "backgroundColor": theme.palette.warning.main,
        "borderColor": theme.palette.warning.main,
      },
      warningOutlined: {
        "&$disabled": {
          color: theme.palette.warning.main,
        },
        "&:hover": {
          borderColor: theme.palette.warning.dark,
        },
        "backgroundColor": theme.palette.common.white,
        "border": `1px solid ${theme.palette.warning.main}`,
        "color": theme.palette.warning.main,
      },
      warningSubtle: {
        "&$disabled": {
          color: theme.palette.warning.main,
        },
        "color": theme.palette.warning.main,
      },
      warningText: {
        "&$disabled": {
          color: theme.palette.warning.main,
        },
        "color": theme.palette.warning.main,
      },
    }),
);

export default useButtonStyles;
