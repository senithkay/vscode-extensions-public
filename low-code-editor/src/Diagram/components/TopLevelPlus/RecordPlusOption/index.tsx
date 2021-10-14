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

import RecordIcon from "../../../../assets/icons/RecordIcon";
import { ConfigOverlayFormStatus } from "../../../../Definitions";
import { FormGenerator } from "../../FormGenerator";
import { DiagramOverlay, DiagramOverlayContainer } from "../../Portals/Overlay";

import "./style.scss";

const recordSubOptionDiv = "record-sub-options";
const recordFromJsonDiv = "record-from-json";

export interface RecordPlusOptionProps {
    isSelected: boolean;
    targetPosition: NodePosition;
    onClose: () => void;
}

export const RecordPlusOption = (props: RecordPlusOptionProps) => {
    const {isSelected, targetPosition, onClose} = props;

    const [isRecordFromVisible, setIsRecordFromVisible] = useState(false);

    const configOverlayFormStatus: ConfigOverlayFormStatus = {
        formArgs: {
            targetPosition: {
                line: (targetPosition as any).startLine - 1 , column: (targetPosition as any).startColumn
            }
        },
        formType: "RecordEditor",
        isLoading: false
    };

    const handleJsonFormClick = () => {
        setIsRecordFromVisible(true);
    };

    return (
        <>
            <div className="plus-option-icon">
                <RecordIcon color={"#CBCEDB"}/>
            </div>
            <p className="plus-option-text">
                Record
            </p>
            <div id={recordSubOptionDiv}/>
            <div id={recordFromJsonDiv}/>
            <DiagramOverlayContainer divId={recordSubOptionDiv} forceRender={isSelected}>
                <DiagramOverlay
                    position={{ x: 0, y: 0 }}
                    stylePosition='relative'
                >
                    <div className="sub-option-container" onClick={handleJsonFormClick}>
                        <div className="sub-option" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <p className="sub-option-text">
                                Create form JSON
                            </p>
                        </div>
                        <div className="sub-option-separator"/>
                        <div className="sub-option" style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                            <p className="sub-option-text">
                                Configure Record
                            </p>
                        </div>
                    </div>
                </DiagramOverlay>
            </DiagramOverlayContainer>
            {isRecordFromVisible && (
                <FormGenerator
                    onCancel={onClose}
                    onSave={onClose}
                    configOverlayFormStatus={configOverlayFormStatus}
                />
            )}
        </>
    );
};
