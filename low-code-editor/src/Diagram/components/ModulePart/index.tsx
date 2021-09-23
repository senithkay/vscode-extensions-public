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
import React from "react";

import { ModulePart, STNode } from "@ballerina/syntax-tree";

import { useStyles } from "../../styles";
import { getSTComponent } from "../../utils";

import './style.scss';

export const GAP_BETWEEN_MEMBERS = 31;
export const INIT_PLUS_MARGIN_LEFT = 24.5;
export const INIT_PLUS_MARGIN_TOP = 7.5;
export const INIT_PLUS_MARGIN_BOTTOM = 7.5;

export interface ModulePartProps {
    model: ModulePart
}

export function ModulePartComponent(props: ModulePartProps) {
    const classes = useStyles();
    const { model } = props;

    const moduleMembers: JSX.Element[] = [];

    model.members.forEach((member: STNode) => {
        moduleMembers.push(
            <div className={'member-container'} >
                {getSTComponent(member)}
            </div>
        )
    });

    return (
        <>
            <div id={'canvas-overlay'} className={classes.OverlayContainer}/>
            {moduleMembers}
        </>
    );
}
