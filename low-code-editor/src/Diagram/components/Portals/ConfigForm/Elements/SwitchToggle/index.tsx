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
// tslint:disable: jsx-no-multiline-js

import React from 'react';

import { Typography } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Switch from '@material-ui/core/Switch';

import { useStyles } from "./style";

export interface SwitchToggleProps {
  onChange: (checked: boolean) => void,
  text?: string;
  className?: string;
  initSwitch?: boolean;
}

export function SwitchToggle(props: SwitchToggleProps) {
  const { text, onChange, initSwitch } = props
  const [checked, setChecked] = React.useState(initSwitch);
  const classes = useStyles();

  const toggleChecked = () => {
    setChecked((prev) => !prev);
    onChange(checked);
  };

  return (
    <FormGroup className={classes.switchWrapper}>
      <FormControlLabel
        label={text ? (<Typography variant="body1" className={classes.toggleTitle}>{text}</Typography>) : null}
        control={
          (
            <Switch
              classes={{ root: classes.root, switchBase: classes.switchBase, thumb: classes.thumb, track: classes.track }}
              checked={checked}
              onChange={toggleChecked}
            />
          )
        }
      />
    </FormGroup>
  );
}



