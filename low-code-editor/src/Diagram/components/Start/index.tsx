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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext, useEffect, useState } from "react";

import {
    FunctionBodyBlock,
    FunctionDefinition,
    ModulePart,
    ObjectMethodDefinition,
    ResourceAccessorDefinition,
    STKindChecker,
} from "@ballerina/syntax-tree";

import { Context } from "../../../Contexts/Diagram";
import {
    TriggerType,
    TRIGGER_TYPES,
    TRIGGER_TYPE_API,
    TRIGGER_TYPE_WEBHOOK
} from "../../models";
import { DefaultConfig } from "../../visitors/default";
import { PlusButton } from "../Plus";
import { DiagramOverlayPosition } from "../Portals/Overlay";
import { TriggerDropDown } from "../Portals/Overlay/Elements";

import {
    StartSVG,
    START_SVG_HEIGHT,
    START_SVG_HEIGHT_WITH_SHADOW,
    START_SVG_WIDTH,
    START_SVG_WIDTH_WITH_SHADOW
} from "./StartSVG";
import "./style.scss";
import { TriggerUpdatedSVG, UPDATE_TRIGGER_SVG_HEIGHT } from "./TriggerUpdatedSVG";

export interface StartButtonProps {
    model: FunctionDefinition | ModulePart | ObjectMethodDefinition | ResourceAccessorDefinition;
}

export function StartButton(props: StartButtonProps) {
    const {
        actions: { diagramRedraw, setTriggerUpdated },
        props: {
            currentAppType,
            syntaxTree,
            isReadOnly,
            isMutationProgress,
        },
        state: {
            triggerUpdated
        }
    } = useContext(Context);


    const [triggerType, setTriggerType] = useState(currentAppType as TriggerType); // FIXME clean up currentAppType vs TriggerType mismatch

    const { model } = props;

    useEffect(() => {
        setTriggerType(currentAppType as TriggerType);
    }, [currentAppType]);

    useEffect(() => {
        if (triggerUpdated) {
            setTimeout(() => {
                setTriggerUpdated(true);
            }, 4000);
        }
    }, [triggerUpdated]);

    const isFunctionKind = model && (STKindChecker.isResourceAccessorDefinition(model)
        || STKindChecker.isObjectMethodDefinition(model)
        || STKindChecker.isFunctionDefinition(model));

    const [activeTriggerType, setActiveTriggerType] = useState<TriggerType>(triggerType);
    const [dropDownC, setdropDownC] = useState<ReactNode>(undefined);
    const [showDropDownC, setShowDropDownC] = useState(!isFunctionKind && !isMutationProgress);

    const viewState = model.viewState;
    const cx = viewState.trigger.cx;
    const cy = viewState.trigger.cy;
    const plusView = viewState.initPlus;
    const initPlusAvailable = viewState.initPlus !== undefined;
    let emptySource = false;

    if (STKindChecker.isFunctionDefinition(model)) {
        const tempModel: FunctionDefinition = model as FunctionDefinition;
        if (STKindChecker.isExpressionFunctionBody(tempModel.functionBody)) {
            emptySource = false;
        } else {
            const body: FunctionBodyBlock = tempModel.functionBody as FunctionBodyBlock;
            emptySource = body.statements.length < 1 || body.statements === undefined;
        }
    } else if (STKindChecker.isModulePart(model)) {
        emptySource = true;
    }

    const handleOnClose = () => {
        if (activeTriggerType !== undefined && TRIGGER_TYPES.indexOf(activeTriggerType) > -1) {
            setShowDropDownC(false);
        }
        if (viewState.initPlus?.isTriggerDropdown) {
            viewState.initPlus.isTriggerDropdown = false;
            viewState.initPlus.selectedComponent = "STATEMENT";
        }
        diagramRedraw(syntaxTree);
    };

    function handleOnComplete(newTrigger: TriggerType) {
        setActiveTriggerType(newTrigger);
        setShowDropDownC(false);
        if (plusView) {
            plusView.isTriggerDropdown = false;
        }
    }

    React.useEffect(() => {
        const position: DiagramOverlayPosition = {
            x: cx + DefaultConfig.triggerPortalOffset.x,
            y: cy + DefaultConfig.triggerPortalOffset.y
        };
        setdropDownC(
            <TriggerDropDown
                position={position}
                onClose={handleOnClose}
                isEmptySource={emptySource}
                triggerType={activeTriggerType}
                onComplete={handleOnComplete}
            />
        );
    }, []);

    useEffect(() => {
        if (isReadOnly && isReadOnly === true) setActiveTriggerType(currentAppType as TriggerType)
    }, [])

    let block: FunctionBodyBlock;
    if (model && isFunctionKind) {
        block = model.functionBody as FunctionBodyBlock;
    }

    let triggerText: string;
    let additionalInfo: string;
    if ((model.kind === "ModulePart") || !activeTriggerType) {
        triggerText = "START";
    } else if (activeTriggerType === TRIGGER_TYPE_API) {
        const functionName = (model as FunctionDefinition).functionName.value;
        additionalInfo = `${functionName.toUpperCase()} /`;
        if ((model as FunctionDefinition)?.relativeResourcePath?.length > 0) {
            triggerText = "RESOURCE";
            (model as FunctionDefinition).relativeResourcePath.forEach((resourcePath: any) => {
                if (resourcePath.value) {
                    additionalInfo += (resourcePath.value?.trim());
                } else {
                    additionalInfo += (resourcePath.source?.trim());
                }
                if (additionalInfo.length >= 15) {
                    additionalInfo = additionalInfo.substr(0, 15);
                    additionalInfo += "...";
                }
            });
        } else {
            triggerText = "FUNCTION";
            additionalInfo = functionName.toUpperCase();
            if (additionalInfo.length >= 15) {
                additionalInfo = additionalInfo.substr(0, 15);
                additionalInfo += "...";
            }
        }
    } else {
        triggerText = activeTriggerType.toUpperCase();
    }

    return (
        // hide edit button for triggers and expression bodied functions
        <g className="start-wrapper">
            <StartSVG
                x={cx - (START_SVG_WIDTH / 2)}
                y={cy - (START_SVG_HEIGHT / 2)}
                text={triggerText}
            />
            {triggerUpdated && <TriggerUpdatedSVG className="animated fadeOut" x={cx + START_SVG_WIDTH_WITH_SHADOW / 2} y={cy - (START_SVG_HEIGHT_WITH_SHADOW / 2 - UPDATE_TRIGGER_SVG_HEIGHT / 2)} />}
            {block && initPlusAvailable && !showDropDownC && <PlusButton viewState={plusView} model={block} initPlus={true} />}
            <g>
                {showDropDownC && dropDownC}
            </g>
        </g>
    );
}
