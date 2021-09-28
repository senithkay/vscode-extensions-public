/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js  jsx-wrap-multiline
import React, { useState } from "react"

import { ServiceDeclaration } from "@ballerina/syntax-tree";

import { getSTComponent } from "../../utils";
import { TopLevelPlus } from "../TopLevelPlus";

import { ServiceHeader } from "./ServiceHeader";
import "./style.scss";

export const DEFAULT_SERVICE_WIDTH: number = 500;
export const SERVICE_MARGIN_LEFT: number = 24.5;
export const SERVICE_PLUS_OFFSET: number = 7.5;

export interface ServiceProps {
    model: ServiceDeclaration;
}

export function Service(props: ServiceProps) {
    const { model } = props;

    const [isExpanded, setIsExpanded] = useState(false);

    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

    const children: JSX.Element[] = []

    model.members.forEach(member => {
        children.push(
            <>
                <div className={'service-member'}>
                    <TopLevelPlus kind={model.kind} targetPosition={member.position} />
                    {getSTComponent(member)}
                </div>
            </>
        )
    });

    return (
        <>
            <div className={'service'} >
                <ServiceHeader model={model} isExpanded={isExpanded} onExpandClick={onExpandClick} />
                {/* initial plus inside a resource function */}
                {/* <TopLevelPlus
                    margin={{ top: SERVICE_PLUS_OFFSET, bottom: SERVICE_PLUS_OFFSET, left: FUNCTION_PLUS_MARGIN_LEFT }}
                /> */}
                <div className={'content-container'}>
                    {isExpanded && (
                        <>
                            {children}
                            <TopLevelPlus kind={model.kind} targetPosition={model.closeBraceToken.position} />
                        </>
                    )}
                </div>
            </div>
            {/* <TopLevelPlus
                margin={{ top: SERVICE_PLUS_OFFSET, bottom: SERVICE_PLUS_OFFSET, left: SERVICE_MARGIN_LEFT }}
            /> */}
        </>
    );
}

