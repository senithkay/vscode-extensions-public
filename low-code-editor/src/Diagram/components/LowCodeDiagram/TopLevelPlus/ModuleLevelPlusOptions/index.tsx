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

import { NodePosition } from "@ballerina/syntax-tree";
import { ClickAwayListener } from "@material-ui/core";

import ClassIcon from "../../../../../assets/icons/ClassIcon";
import ConstantIcon from "../../../../../assets/icons/ConstantIcon";
import ListenerIcon from "../../../../../assets/icons/ListenerIcon";
import ServiceIcon from "../../../../../assets/icons/ServiceIcon";
import VariableIcon from "../../../../../assets/icons/VariableIcon";
import { Margin } from "../index";
import { RecordPlusOption } from "../RecordPlusOption";

import "./style.scss";

export interface ModuleLevelPlusOptionsProps {
    margin?: Margin;
    onClose: () => void;
    targetPosition: NodePosition;
}

export const ModuleLevelPlusOptions = (props: ModuleLevelPlusOptionsProps) => {
    const { onClose, targetPosition } = props;

    const [isRecordSelected, setIsRecordSelected] = useState(false);

    const handleRecordClose = () => {
        setIsRecordSelected(false);
        onClose();
    };

    const handleJsonFormClick = () => {
        setIsRecordSelected(true);
    };

    const handleClickAway = () => {
        setIsRecordSelected(false);
        onClose();
    };

    return (
        <>
            <ClickAwayListener
                mouseEvent="onMouseDown"
                touchEvent="onTouchStart"
                onClickAway={handleClickAway}
            >
                <div className="plus-option-container">
                    <div
                        className="plus-option"
                        style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                        onClick={handleJsonFormClick}
                    >
                        <RecordPlusOption
                            targetPosition={targetPosition}
                            isSelected={isRecordSelected}
                            onClose={handleRecordClose}
                        />
                    </div>
                    <div className="plus-option-separator"/>
                    <div className="plus-option">
                        <div className="plus-option-icon">
                            <ConstantIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Constant
                        </p>
                    </div>
                    <div className="plus-option-separator"/>
                    <div className="plus-option">
                        <div className="plus-option-icon">
                            <VariableIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Variable
                        </p>
                    </div>
                    <div className="plus-option-separator"/>
                    <div className="plus-option">
                        <div className="plus-option-icon">
                            <ServiceIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Service
                        </p>
                    </div>
                    <div className="plus-option-separator"/>
                    <div className="plus-option">
                        <div className="plus-option-icon">
                            <ClassIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Class
                        </p>
                    </div>
                    <div className="plus-option-separator"/>
                    <div className="plus-option" style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                        <div className="plus-option-icon">
                            <ListenerIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Listener
                        </p>
                    </div>
                </div>
            </ClickAwayListener>
        </>
    );
};
