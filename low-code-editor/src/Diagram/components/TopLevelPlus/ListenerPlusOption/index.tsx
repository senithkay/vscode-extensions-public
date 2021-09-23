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

import ListenerIcon from "../../../../assets/icons/ListenerIcon";
import RecordIcon from "../../../../assets/icons/RecordIcon";
import { DraftInsertPosition } from "../../../view-state/draft";
import { RecordEditor } from "../../ConfigForms/RecordEditor";
import { DiagramOverlay, DiagramOverlayContainer } from "../../Portals/Overlay";

import "./style.scss";

const listenerDiv = "listener-plus-form";
// const recordFromJsonDiv = "record-from-json";

export interface ListenerPlusOptionProps {
    isSelected: boolean;
    targetPosition: DraftInsertPosition;
    onClose: () => void;
}

export const ListenerPlusOption = (props: ListenerPlusOptionProps) => {
    const { isSelected, targetPosition, onClose } = props;

    const [isListenerFormVisible, setIsListenerFormVisible] = useState(false);

    const handleJsonFormClick = () => {
        setIsListenerFormVisible(true);
    };

    return (
        <>
            <div className="plus-option-icon">
                <ListenerIcon color={"#CBCEDB"} />
            </div>
            <p className="plus-option-text">
                Listener
            </p>
            <div id={listenerDiv} />
            <DiagramOverlayContainer divId={listenerDiv} forceRender={isSelected}>
                <DiagramOverlay
                    position={{ x: 0, y: 0 }}
                    stylePosition='relative'
                >
                    <div className="sub-option-container" style={{ height: "auto", width: "290px", background: "#fff", border: "1px solid #e6e7ec" }}>
                        <div className="sub-option" style={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>
                            <p className="sub-option-text">
                                Create Listener
                            </p>
                        </div>
                        <div className="sub-option-separator" />
                        <div>
                            <RecordEditor onCancel={onClose} targetPosition={targetPosition} />
                        </div>
                        {/* <div className="sub-option" style={{ borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                            <p className="sub-option-text">
                                Configure Record
                            </p>
                        </div> */}
                    </div>
                </DiagramOverlay>
            </DiagramOverlayContainer>
            {/* todo: Integrate with new config pannel */}
            {/* {isListenerFormVisible && (
                <DiagramOverlayContainer divId={recordFromJsonDiv} forceRender={isListenerFormVisible}>
                    <DiagramOverlay
                        position={{ x: 0, y: 0 }}
                        stylePosition='relative'
                    >
                        <div style={{ height: "auto", width: "290px", background: "#fff", border: "1px solid #e6e7ec" }}>
                            <RecordEditor onCancel={onClose} targetPosition={targetPosition} />
                        </div>
                    </DiagramOverlay>
                </DiagramOverlayContainer>
            )} */}
        </>
    );
};
