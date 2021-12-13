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
import React, { useEffect, useRef, useState } from "react";

import { NodePosition } from "@wso2-enterprise/syntax-tree";
import classNames from "classnames";

import TopLevelPlusIcon from "../../../../../../assets/icons/TopLevelPlusIcon";
import Tooltip from "../../../../../../components/TooltipV2";
import { OverlayBackground } from "../../../../OverlayBackground";
import { DiagramOverlay, DiagramOverlayContainer } from "../../../../Portals/Overlay";

import { InitialPlusTooltipBubble } from "./InitialPlusTooltipBubble";
import { PlusOptionsSelector } from "./PlusOptionsSelector";
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
    kind: string,
    initPlus?: boolean;
    margin?: Margin;
    targetPosition?: NodePosition;
    isTriggerType?: boolean;
    isDocumentEmpty?: boolean;
    isModuleLevel?: boolean;
    isLastMember?: boolean;
}

export const TopLevelPlus = (props: PlusProps) => {
    const { targetPosition, kind, isTriggerType, isDocumentEmpty, isModuleLevel, isLastMember } = props;
    const containerElement = useRef(null);


    const [isPlusOptionsVisible, setIsPlusOptionsVisible] = useState(false);
    const [isPlusClicked, setPlusClicked] = useState(false);

    const handlePlusClick = () => {
        setPlusClicked(true);
        setIsPlusOptionsVisible(true);
    };

    const handlePlusOptionsClose = () => {
        setPlusClicked(false);
        setIsPlusOptionsVisible(false);
    };

    return (
        <div className="plus-container" ref={containerElement}>
            <div className={'plus-btn-wrapper'} onClick={handlePlusClick}>
                {
                    !isDocumentEmpty ?
                        <Tooltip type={"heading-content"} placement="right" arrow={true} text={{ content: 'Add Construct' }}>
                            <div>
                                <TopLevelPlusIcon />
                            </div>
                        </Tooltip>
                        : <TopLevelPlusIcon />
                }
            </div>
            {
                isModuleLevel && isDocumentEmpty && !isPlusClicked && (
                   <InitialPlusTooltipBubble />
                )
            }
            {
                isPlusOptionsVisible && (
                    <DiagramOverlayContainer>
                        <DiagramOverlay
                            position={
                                containerElement.current ?
                                    { x: containerElement.current.offsetLeft, y: containerElement.current.offsetTop }
                                    : { x: 0, y: 0 }
                            }
                        >
                            <PlusOptionsSelector
                                kind={kind}
                                onClose={handlePlusOptionsClose}
                                targetPosition={targetPosition}
                                isTriggerType={isTriggerType}
                                isLastMember={isLastMember}
                            />
                            {isPlusOptionsVisible && <OverlayBackground />}
                        </DiagramOverlay>
                    </DiagramOverlayContainer>
                )
            }
        </div>
    );
};
