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
import React from "react";

import { ModulePart, STNode } from "@ballerina/syntax-tree";

import { getSTComponent } from "../../utils";
import { TopLevelPlus } from "../TopLevelPlus";

export const GAP_BETWEEN_MEMBERS = 31;
export const INIT_PLUS_MARGIN_LEFT = 24.5;
export const INIT_PLUS_MARGIN_TOP = 7.5;
export const INIT_PLUS_MARGIN_BOTTOM = 7.5;

export interface ModulePartProps {
    model: ModulePart
}

export function ModulePartComponent(props: ModulePartProps) {
    const { model } = props;

    const moduleMembers: JSX.Element[] = [];
    model.members.forEach((member: STNode) => {
        moduleMembers.push(getSTComponent(member))
    });

    return (
        <>
            <TopLevelPlus
                margin={{ top: INIT_PLUS_MARGIN_TOP, bottom : INIT_PLUS_MARGIN_BOTTOM, left: INIT_PLUS_MARGIN_LEFT }}
            />
            {moduleMembers}
        </>
    );
}
