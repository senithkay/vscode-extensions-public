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
import React, {useState} from "react";

import { ClickAwayListener } from "@material-ui/core";

import ClassIcon from "../../../../assets/icons/ClassIcon";
import ConstantIcon from "../../../../assets/icons/ConstantIcon";
import ListenerIcon from "../../../../assets/icons/ListenerIcon";
import RecordIcon from "../../../../assets/icons/RecordIcon";
import ServiceIcon from "../../../../assets/icons/ServiceIcon";
import VariableIcon from "../../../../assets/icons/VariableIcon";
import { Margin } from "../index";

import {RecordEditor} from "../../ConfigForms/RecordEditor";
import "./style.scss";
import {DraftInsertPosition} from "../../../view-state/draft";

export interface PlusOptionsProps {
    margin?: Margin;
    onClose: () => void;
    targetPosition?: DraftInsertPosition;
}

export const PlusOptions = (props: PlusOptionsProps) => {
    const { margin = { top: 0, bottom: 0, left: 0, right: 0 }, onClose, targetPosition } = props;

    const optionContainerMargin = {
        marginBottom: margin.bottom,
        marginLeft: margin.left
    }

    const [isRecordFromVisible, setIsRecordFromVisible] = useState(false);
    const handleJsonFormClose = () => {
        setIsRecordFromVisible(false);
        onClose();
    };

    const handleJsonFormClick = () => {
        setIsRecordFromVisible(true);
    };

    return (
        <>
            <ClickAwayListener
                mouseEvent="onMouseDown"
                touchEvent="onTouchStart"
                onClickAway={handleJsonFormClose}
            >
                <div className="plus-option-container" style={optionContainerMargin}>
                    <div onClick={handleJsonFormClick} className="plus-option" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                        <div className="plus-option-icon">
                            <RecordIcon color={"#CBCEDB"}/>
                        </div>
                        <p className="plus-option-text">
                            Record
                        </p>
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
            {isRecordFromVisible && (
                <div style={{ height: "auto", width: "290px", background: "#fff", marginLeft: margin.left, border: "1px solid #e6e7ec" }}>
                    <RecordEditor onCancel={handleJsonFormClose} targetPosition={targetPosition}/>
                </div>
            )}
        </>
    );
};
