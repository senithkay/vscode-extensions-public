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
import React, { useContext, useRef, useState } from "react";

import { Margin } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import TopLevelPlusIcon from "../../../../../../assets/icons/TopLevelPlusIcon";
import Tooltip from "../../../../../../components/TooltipV2";
// import { classMemberEntries, moduleLevelEntries, PlusMenuCategories, PlusOptionsSelector, triggerEntries } from "../../../../FormComponents/DialogBoxes/TopLevelPlus/PlusOptionsSelector";
import { OverlayBackground } from "../../../../OverlayBackground";
import { DiagramOverlay, DiagramOverlayContainer } from "../../../../Portals/Overlay";
import { Context } from "../../../Context/diagram";

import { InitialPlusTooltipBubble } from "./InitialPlusTooltipBubble";
import "./style.scss";

export const PLUS_WIDTH = 16;
export const PLUS_AND_OPTIONS_GAP = 6;

export interface PlusProps {
    kind: string,
    initPlus?: boolean;
    margin?: Margin;
    targetPosition?: NodePosition;
    isTriggerType?: boolean;
    isDocumentEmpty?: boolean;
    isModuleLevel?: boolean;
    isLastMember?: boolean;
    showCategorized?: boolean;
}

export const TopLevelPlus = (props: PlusProps) => {
    const { targetPosition, kind, isTriggerType, isDocumentEmpty, isModuleLevel, isLastMember, showCategorized } = props;
    const containerElement = useRef(null);
    const diagramContext = useContext(Context);
    const renderPlusWidget = diagramContext?.api?.edit?.renderPlusWidget;

    const [plusOptions, setPlusOptions] = useState(undefined);
    const [isPlusClicked, setPlusClicked] = useState(false);

    const handlePlusClick = () => {
        setPlusClicked(true);
        // setIsPlusOptionsVisible(true);
        setPlusOptions(renderPlusWidget("TopLevelOptionRenderer", {
            position: (containerElement.current ?
                {
                    x: containerElement.current.offsetLeft,
                    y: 0
                } : {
                    x: 0,
                    y: 0
                }),
            onClose: handlePlusOptionsClose,
            offset: containerElement?.current?.offsetTop,
            kind,
            targetPosition,
            isTriggerType,
            isLastMember,
            showCategorized
        }));
    };

    const handlePlusOptionsClose = () => {
        setPlusClicked(false);
        setPlusOptions(undefined);
    };

    return (
        <div className="plus-container" ref={containerElement} target-line={targetPosition.startLine}>
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
            {isPlusClicked && plusOptions}
        </div>
    );
};
