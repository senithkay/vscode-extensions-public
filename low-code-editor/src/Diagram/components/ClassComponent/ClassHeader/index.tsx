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
import React from 'react';

import { ClassDefinition } from '@ballerina/syntax-tree';

import ClassIcon from '../../../../assets/icons/ClassIcon';
import { ComponentExpandButton } from '../../ComponentExpandButton';

interface ClassHeaderProps {
    model: ClassDefinition;
    onExpandClick: () => void;
    isExpanded: boolean;
}

export function ClassHeader(props: ClassHeaderProps) {
    const { model, onExpandClick, isExpanded } = props;
    return (
        <div className={'class-component-header'}>
            <div className={'header-segement-container'}>
                <div className="header-segment" >
                    <ClassIcon />
                </div>
                <div className="header-segment">
                    {model.className.value}
                </div>
            </div>
            <ComponentExpandButton isExpanded={isExpanded} onClick={onExpandClick} />
        </div >
    );
}
