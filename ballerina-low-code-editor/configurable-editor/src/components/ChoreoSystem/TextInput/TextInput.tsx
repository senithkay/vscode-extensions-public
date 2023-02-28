/* eslint-disable react/jsx-props-no-spreading */
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
import React from 'react'
import {
  Box,
  InputBase,
  InputProps,
  FormHelperText,
  Typography,
  CircularProgress,
  TooltipProps,
  Tooltip,
} from '@material-ui/core';
import clsx from 'clsx';
import useTextFiledStyles from './TextInput.styles';
import { InfoIcon, QuestionMark } from '../../../assets/icons';

interface ITextInputProps extends InputProps {
  width?: string | number;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  optional?: boolean;
  loading?: boolean;
  tooltip?: React.ReactNode;
  info?: React.ReactNode;
  tooltipPlacement?: TooltipProps['placement']; 
}

const TextInput = (props: ITextInputProps) => {
  const classes = useTextFiledStyles();
  const {
    label,
    width,
    readOnly,
    error,
    helperText,
    rows,
    multiline,
    optional,
    loading,
    tooltip,
    tooltipPlacement = 'right', 
    info,
    ...rest
  } = props;

  const toolTip = tooltip && (tooltip !== "") && (
    <Tooltip
      title={tooltip}
      placement={tooltipPlacement}
    >
      <Box className={classes.tooltipIcon}>
        <QuestionMark />
      </Box>
    </Tooltip>
  ); 
  return (
    <Box width={width}>
      {(label || toolTip) && (
        <Box className={classes.formLabel}>
          {label && <Typography component="h6">{label}</Typography>}
          {info && <Box className={classes.formLabelInfo}>{info}</Box>}
          <Box className={classes.formLabelAction}>
            {optional && (
              <Typography variant="body2" className={classes.formOptional}>
                Optional
              </Typography>
            )}
            {toolTip && (
              <Box className={classes.formLabelTooltip}>{toolTip}</Box>
            )}
          </Box>
        </Box>
      )}
 
        <Box className={classes.inputGroup}>
          <InputBase
            classes={{
              root: clsx({
                [classes.root]: true,
                [classes.readOnly]: readOnly,
                [classes.multiline]: multiline,
              }),
              focused: classes.focused,
              error: classes.error,
              inputMultiline: classes.textarea,
            }}
            readOnly={readOnly}
            {...rest}
            error={error}
            rows={rows}
            multiline={multiline}
          />
        </Box>
   
      {error && helperText && (
        <FormHelperText error={error}>
          <Box display="flex" alignItems="center">
            <InfoIcon />
            <Box ml={1}>{helperText}</Box>
          </Box>
        </FormHelperText>
      )}
      {loading && helperText && (
        <FormHelperText>
          <Box display="flex" alignItems="center">
            <CircularProgress size={12} />
            <Box ml={1}>{helperText}</Box>
          </Box>
        </FormHelperText>
      )}
    </Box>
  );
};

export default TextInput;
