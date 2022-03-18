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
import React, { ReactElement, useContext, useEffect, useRef, useState } from "react";

import { Margin, TopLevelPlusIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../Context/diagram";

import { InitialPlusTooltipBubble } from "./InitialPlusTooltipBubble";
import "./style.scss";
import { DiagramTooltipCodeSnippet } from "../../../../../low-code-ui-components/lib";

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
    const showTooltip = diagramContext?.api?.edit?.showTooltip;
    const [tooltip, setTooltip] = useState(undefined);

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

    // useEffect(() => {
    //     if (!isDocumentEmpty && showTooltip) {
    //         setDiagTooltip(showTooltip(<TopLevelPlusIcon />,'Add Construct'));
    //     }
    // }, [isDocumentEmpty])

    useEffect(() => {
        if (!isDocumentEmpty && showTooltip) {
            setTooltip(showTooltip(<TopLevelPlusIcon />, "Add Construct"));
        }
        return () => {
            setTooltip(undefined);
        };
    }, [isDocumentEmpty]);

    return (
        <div className="plus-container" ref={containerElement} target-line={targetPosition.startLine}>
            <div className={'plus-btn-wrapper'} onClick={handlePlusClick}>
                {
                    !isDocumentEmpty && tooltip ?
                        tooltip
                        : 
                            <TopLevelPlusIcon /> 
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
