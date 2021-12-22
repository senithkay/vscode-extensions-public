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
import React, { useState } from "react";

import { ClassDefinition } from "@wso2-enterprise/syntax-tree";

import { getSTComponent, getSTComponents } from "../../../../../utils";
import { TopLevelPlus } from "../../PlusButtons/TopLevelPlus";

import { ClassHeader } from "./ClassHeader";
import './style.scss'

export interface ClassComponentProps {
    model: ClassDefinition
}

export function ClassComponent(props: ClassComponentProps) {
    const { model } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    const onExpandClick = () => {
        setIsExpanded(!isExpanded);
    }

    // const children: JSX.Element[] = []

    // model.members.forEach(member => {
    //     children.push(
    //         <div className={'class-member'} >
    //             {/* <TopLevelPlus kind={model.kind} targetPosition={member.position} /> */}
    //             {getSTComponent(member)}
    //         </div>
    //     )
    // });

    // const classComponentBody = isExpanded && (
    //     <>
    //         {children}
    //         <div className={'class-member'} >
    //             {/* <TopLevelPlus kind={model.kind} targetPosition={model.closeBrace.position} /> */}
    //         </div>
    //     </>
    // );

    return (
        <div className={'class-component'}>
            <ClassHeader model={model} onExpandClick={onExpandClick} isExpanded={isExpanded} />
        </div>
    );
}
