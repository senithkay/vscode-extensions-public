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
import { Chip as MUIChip, ChipProps as MUIChipProps } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import useStyles from './Chip.style';

interface ChipProps extends Omit<MUIChipProps, 'color' | 'size' | 'variant'> {
  color?:
    | 'info'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'default'
    | 'warning'
    | 'error';
  size?: 'small' | 'medium' | 'large';
  variant?: 'contained' | 'outlined';
}

function Chip(props: ChipProps) {
  const {
    label,
    color = 'default',
    variant = 'contained',
    size = 'medium',
  } = props;

  const classes = useStyles();

  return (
    <MUIChip
      classes={{
        root: clsx(
          classes.root,
          classes[size],
          classes[variant],
          classes[color]
        ),
      }}
      label={label}
    />
  );
}

export default Chip;
