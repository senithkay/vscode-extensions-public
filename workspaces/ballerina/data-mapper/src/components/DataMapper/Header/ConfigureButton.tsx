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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { Button, makeStyles, useMediaQuery } from '@material-ui/core';
import { withStyles } from "@material-ui/core/styles";
import TooltipBase from "@material-ui/core/Tooltip";

import RoundEditIcon from "../../../assets/icons/EditIcon";

import {headerStyles} from "./DataMapperHeader";

const useStyles = makeStyles((theme) => ({
    button: {
        textTransform: 'none',
        boxSizing: 'border-box',
        background: '#F7F8FB',
        border: '1px solid #E0E2E9',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        borderRadius: '5px',
        color: '#40404B',
        fontSize: '13px',
        fontWeight: 400
    }
}));

interface ConfigureButtonProps {
    onClick: () => void;
}

export default function ConfigureButton(props: ConfigureButtonProps) {
    const { onClick } = props;
    const classes = useStyles();
    const showText = useMediaQuery('(min-width:500px)');
    const TooltipComponent = withStyles(headerStyles)(TooltipBase);

    return (
        <TooltipComponent
            interactive={false}
            arrow={true}
            title={"Edit data mapper name, inputs and the output"}
        >
            <Button
                onClick={onClick}
                variant="outlined"
                startIcon={<RoundEditIcon />}
                className={classes.button}
            >
                {showText ? 'Configure' : null}
            </Button>
        </TooltipComponent>
    );
}
