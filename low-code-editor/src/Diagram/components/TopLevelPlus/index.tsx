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
import React, { useState } from "react";

import { STNode } from "@ballerina/syntax-tree";

import TopLevelPlusIcon from "../../../assets/icons/TopLevelPlusIcon";

import { PlusOptions } from "./PlusOptions";
import "./style.scss";

export const PLUS_WIDTH = 16;
export const PLUS_AND_OPTIONS_GAP = 6;

export interface Margin {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
}

export interface PlusProps {
    model?: STNode,
    initPlus?: boolean;
    margin?: Margin;
}

export const TopLevelPlus = (props: PlusProps) => {
    const { model, initPlus = false, margin = { top: 0, bottom: 0, left: 0, right: 0 } } = props;

    const [isPlusOptionsVisible, setIsPlusOptionsVisible] = useState(false);

    const plusIconMargin = isPlusOptionsVisible ?
        {
            marginTop: margin.top,
            marginRight: margin.right,
            marginLeft: margin.left
        } :
        {
            marginTop: margin.top,
            marginBottom: margin.bottom,
            marginRight: margin.right,
            marginLeft: margin.left
        };
    const optionContainerMargin: Margin = {
        bottom: margin.bottom,
        left: margin.left + PLUS_WIDTH + PLUS_AND_OPTIONS_GAP
    }

    const handlePlusClick = () => {
        setIsPlusOptionsVisible(true);
    };

    const handlePlusOptionsClose = () => {
        setIsPlusOptionsVisible(false);
    };

    return (
        <div className="plus-container">
            <div className="plus-icon" style={plusIconMargin} onClick={handlePlusClick}>
                <TopLevelPlusIcon />
            </div>
            {isPlusOptionsVisible && (
                <PlusOptions margin={optionContainerMargin} onClose={handlePlusOptionsClose} />
            )}
        </div>
    );
};
