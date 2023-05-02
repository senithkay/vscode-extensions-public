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

import styled from "@emotion/styled";
import { Button, makeStyles, useMediaQuery } from '@material-ui/core';

import RoundEditIcon from "../../../assets/icons/EditIcon";

const useStyles = makeStyles((theme) => ({
    filterIcon: {
        height: '10px',
    }
}));

const ConfigurationButton = styled.div`
    :hover {
        background: #e5e6ea;
        cursor: pointer;
    },
    box-sizing: border-box;
    padding: 4px 16px 4px 10px;
    background: #F7F8FB;
    border: 1px solid #E0E2E9;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
    border-radius: 5px;
    display: inline-flex;
    color: #40404B;
    align-items: center;
    position: absolute;
    right: 15px;
`;

const ConfBtnText = styled.div`
    font-weight: 400;
    font-size: 13px;
    line-height: 24px;
    margin-left: 5px;
`;

interface ConfigureButtonProps {
    onClick: () => void;
}

export default function ConfigureButton(props: ConfigureButtonProps) {
    const { onClick } = props;
    const showText = useMediaQuery('(min-width:500px)');

    return (
        <Button
            onClick={onClick}
            variant="outlined"
            startIcon={<RoundEditIcon />}
        >
            {showText ? 'Configure' : null}
        </Button>
    );
}
