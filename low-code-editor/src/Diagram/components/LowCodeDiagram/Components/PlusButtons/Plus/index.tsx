/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useRef, useState } from "react";

import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BlockStatement, FunctionBodyBlock, LocalVarDecl } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { DefaultConfig } from "../../../../../visitors/default";
import { Context } from "../../../Context/diagram";
import { useFunctionContext } from "../../../Context/Function";
import { BlockViewState } from "../../../ViewState";
import { PlusViewState } from "../../../ViewState/plus";

import { PlusCircleSVG, PLUSCIRCLE_SVG_HEIGHT_WITH_SHADOW, PLUSCIRCLE_SVG_WIDTH_WITH_SHADOW } from "./Circle";
import { SmallPlusSVG, SMALLPLUS_SVG_HEIGHT_WITH_SHADOW, SMALLPLUS_SVG_WIDTH_WITH_SHADOW } from "./Default";
import "./style.scss";

export interface PlusProps {
    viewState: PlusViewState,
    model?: BlockStatement | FunctionBodyBlock,
    initPlus: boolean
}

export interface PlusStates {
    isSmallPlusShown?: boolean,
    isCollapsePlusDuoShown?: boolean,
    isPlusHolderShown?: boolean
}

export const PlusButton = (props: PlusProps) => {
    const {
        props: {
            syntaxTree,
            isReadOnly
        },
        api: {
            edit: {
                renderPlusWidget
            }
        },
        actions: { diagramCleanDraw, diagramRedraw },
    } = useContext(Context);

    const { overlayId, overlayNode } = useFunctionContext();

    const { viewState, model, initPlus } = props;
    const plusRef = useRef(null);

    const [states, setStates] = useState<PlusStates>({
        isCollapsePlusDuoShown: false,
        isSmallPlusShown: false,
        // check if the app is in initial state and has no statements, and has no drafted component in the diagram
        isPlusHolderShown: initPlus && !(model?.statements.length > 0) && !viewState.draftSubType,
    });

    const [plusHolder, setPlusHolder] = useState(undefined);

    const classes = states.isSmallPlusShown ? cn("holder-show") : cn("holder-hide");
    const x = viewState.bBox.cx;
    const y = viewState.bBox.cy;

    // On mouse enter the small plus button.
    const onMouseEnter = () => {
        if (!states.isCollapsePlusDuoShown && !states.isPlusHolderShown) {
            setStates({
                isSmallPlusShown: true,
                isCollapsePlusDuoShown: states.isCollapsePlusDuoShown,
                isPlusHolderShown: states.isPlusHolderShown
            });
        }
    };

    // On mouse leave the small plus button.
    const onMouseLeave = () => {
        setStates({
            isSmallPlusShown: false,
            isCollapsePlusDuoShown: states.isCollapsePlusDuoShown,
            isPlusHolderShown: states.isPlusHolderShown
        });
    };

    // On click for the plus button in plus collapse button.
    const handlePlusClick = () => {
        setStates({
            isPlusHolderShown: true
        });
        viewState.expanded = true;
        viewState.selectedComponent = "STATEMENT";
        viewState.collapsedClicked = false;
        viewState.collapsedPlusDuoExpanded = false;
        diagramRedraw(syntaxTree);
        setPlusHolder(renderPlusWidget("PlusElements", {
            position: { x: (x - (DefaultConfig.plusHolder.width / 2)), y: (y) },
            onClose: handleOnClose,
            onChange: handlePlusHolderItemClick,
            initPlus: initPlus,
            isCallerAvailable: (model.viewState as BlockViewState)?.isCallerAvailable,
            isResource: (model.viewState as BlockViewState)?.isResource,
            overlayId: overlayId,
            overlayNode: overlayNode
        }, viewState as PlusViewState));
    };

    // On click for the collapse button in plus collapse button.
    const handleCollapseClick = () => {
        if (!viewState.collapsed && !viewState.isLast) {
            setStates({
                isPlusHolderShown: false,
                isSmallPlusShown: false,
                isCollapsePlusDuoShown: false
            });
            const blockViewState: BlockViewState = model.viewState as BlockViewState;
            viewState.collapsedClicked = true;
            viewState.collapsedPlusDuoExpanded = false;
            viewState.expanded = false;
            if (!viewState.isLast) {
                blockViewState.collapseView = undefined;
                blockViewState.collapsed = false;
            }
            diagramRedraw(syntaxTree);
        }
    };

    // click away handler for plus.
    const handleClickAway = () => {
        if (!initPlus && (states.isCollapsePlusDuoShown)) {
            setStates({
                ...states,
                isSmallPlusShown: false,
                isCollapsePlusDuoShown: false
            });
            viewState.selectedComponent = undefined;
            viewState.expanded = false;
            viewState.collapsedClicked = false;
            viewState.collapsedPlusDuoExpanded = false;
            diagramCleanDraw(syntaxTree);
        }
    };

    const handleOnClose = () => {
        if (!initPlus) {
            setStates({
                ...states,
                isPlusHolderShown: false
            });
            viewState.selectedComponent = undefined;
            viewState.expanded = false;
            viewState.collapsedClicked = false;
            viewState.collapsedPlusDuoExpanded = false;
            diagramCleanDraw(syntaxTree);
            setPlusHolder(undefined);
        }
    }

    const handlePlusHolderItemClick = (type: string, subType: string,
        connectorType: BallerinaConnectorInfo = undefined, isExisting?: boolean, selectedConnector?: LocalVarDecl) => {
        setStates({
            isPlusHolderShown: false,
            isSmallPlusShown: false,
            isCollapsePlusDuoShown: false
        });
        viewState.expanded = false;
        viewState.collapsedClicked = false;
        viewState.collapsedPlusDuoExpanded = false;
        viewState.draftAdded = type;
        viewState.draftSubType = subType;
        viewState.draftSelectedConnector = selectedConnector;
        viewState.draftConnector = connectorType;
        viewState.draftForExistingConnector = isExisting;
        diagramRedraw(syntaxTree);
        setPlusHolder(undefined);
    };

    const plusCircle = !initPlus && !states.isPlusHolderShown && !states.isCollapsePlusDuoShown && viewState.visible ?
        (
            <PlusCircleSVG
                x={x - (PLUSCIRCLE_SVG_WIDTH_WITH_SHADOW / 2)}
                y={y - (PLUSCIRCLE_SVG_HEIGHT_WITH_SHADOW / 2)}
            />
        ) : null;
    const smallPlus = !states.isPlusHolderShown && viewState.visible && !initPlus ?
        (
            <g
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                data-testid="plus-button"
                className={classes}
                x={x}
            >
                <g>
                    <SmallPlusSVG
                        x={x - (SMALLPLUS_SVG_WIDTH_WITH_SHADOW / 2)}
                        y={y - (SMALLPLUS_SVG_HEIGHT_WITH_SHADOW / 2)}
                        handlePlusClick={handlePlusClick}
                    />
                </g>
            </g>
        ) : null;

    useEffect(() => {
        if (initPlus && overlayNode) {
            setStates({
                isPlusHolderShown: true
            });
            setPlusHolder(renderPlusWidget("PlusElements", {
                position: { x: (x - (DefaultConfig.plusHolder.width / 2)), y: (y) },
                onClose: handleOnClose,
                onChange: handlePlusHolderItemClick,
                initPlus: initPlus,
                isCallerAvailable: (model.viewState as BlockViewState)?.isCallerAvailable,
                isResource: (model.viewState as BlockViewState)?.isResource,
                overlayId: overlayId,
                overlayNode: overlayNode
            }, viewState as PlusViewState));
        }
    }, [initPlus, overlayNode]);

    return (
        <g ref={plusRef}>
            {
                (!isReadOnly) && (<g className="main-plus-wrapper" data-plus-index={viewState.index}>
                    {plusCircle}
                    {plusHolder}
                    {/* <ClickAwayListener
                        mouseEvent="onMouseDown"
                        touchEvent="onTouchStart"
                        onClickAway={handleClickAway}
                    > */}
                    <g>
                        {smallPlus}
                    </g>

                    {/* </ClickAwayListener> */}
                </g>)
            }
        </g>
    );
};
