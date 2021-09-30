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
// tslint:disable: jsx-no-multiline-js jsx-wrap-multiline object-literal-shorthand align
import React from "react";

import { STKindChecker, STNode } from "@ballerina/syntax-tree";

import { DraftInsertPosition } from "../../../view-state/draft";
import { Margin } from "../index";
import { ModuleLevelPlusOptions } from "../ModuleLevelPlusOptions";
import { PlusOptionRenderer } from "../PlusOptionRenderer";

export interface PlusOptionsProps {
    kind: string
    margin?: Margin;
    onClose: () => void;
    targetPosition?: DraftInsertPosition;
}

const moduleLevelEntries = [
    'Service',
    'Variable',
    'Listener',
    'Type Definition',
    'Class',
    'Constant'
];

const serviceLevelEntries = [
    'Variable',
    'Resource',
    'Function'
];

export const PlusOptionsSelector = (props: PlusOptionsProps) => {
    const { onClose, targetPosition, kind } = props;

    let menuEntries: string[] = [];

    switch (kind) {
        case 'ModulePart':
            menuEntries = moduleLevelEntries;
            break;
        case 'ServiceDeclaration':
            menuEntries = serviceLevelEntries;
            break;
        default:
    }

    return (
        <>
            <PlusOptionRenderer entries={menuEntries} onClose={onClose} targetPosition={targetPosition} />
        </>
    );
};
