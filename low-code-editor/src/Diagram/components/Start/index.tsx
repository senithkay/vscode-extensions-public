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
    CaptureBindingPattern,
    FunctionBodyBlock,
    FunctionDefinition,
    ModulePart, ModuleVarDecl,
    ServiceDeclaration, SimpleNameReference,
    STKindChecker,
} from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import {
    TriggerType,
    TRIGGER_TYPES,
    TRIGGER_TYPE_WEBHOOK
} from "../../models";
import { getConfigDataFromSt } from "../../utils/st-util";
import { DefaultConfig } from "../../visitors/default";
import { PlusButton } from "../Plus";
import { DiagramOverlayPosition } from "../Portals/Overlay";
import { ConnectorType, TriggerDropDown } from "../Portals/Overlay/Elements";

import {
    StartSVG,
    START_SVG_HEIGHT_WITH_SHADOW,
    START_SVG_WIDTH_WITH_SHADOW
} from "./StartSVG";
import "./style.scss";

export interface StartButtonProps {
    model: FunctionDefinition | ModulePart;
}

export function StartButton(props: StartButtonProps) {
    const { state, diagramCleanDraw, diagramRedraw } = useContext(DiagramContext);
    const isMutationProgress = state.isMutationProgress || false;
    const { syntaxTree, appInfo, originalSyntaxTree } = state;

    const { currentApp } = appInfo || {};
    let displayType = currentApp ? currentApp.displayType : "";
    const [triggerType, setTriggerType] = useState(displayType as TriggerType);

    const { model } = props;

    useEffect(() => {
        displayType = currentApp ? currentApp.displayType : "";
        setTriggerType(displayType);
    }, [displayType])

    const [activeTriggerType, setActiveTriggerType] = useState<TriggerType>(triggerType);
    const [dropDownC, setdropDownC] = useState<ReactNode>(undefined);
    const [showDropDownC, setShowDropDownC] = useState(!STKindChecker.isFunctionDefinition(model)
        && !isMutationProgress);

    const viewState = model.viewState;
    const cx = viewState.trigger.cx;
    const cy = viewState.trigger.cy;
    const plusView = viewState.initPlus;
    const initPlusAvailable = viewState.initPlus !== undefined;
    let emptySource = false;

    if (STKindChecker.isFunctionDefinition(model)) {
        const tempModel: FunctionDefinition = model as FunctionDefinition;
        const body: FunctionBodyBlock = tempModel.functionBody as FunctionBodyBlock;
        emptySource = body.statements.length < 1 || body.statements === undefined;
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

    const handleSubMenuClose = () => {
        setShowDropDownC(false);
        setdropDownC(undefined);
    };

    const handleOnScheduleComplete = () => {
        handleOnComplete(activeTriggerType);
    }

    const getWebhookType = () : ConnectorType => {
        const webHookSyntaxTree = originalSyntaxTree as ModulePart;
        const services: ServiceDeclaration[] = webHookSyntaxTree.members.filter(member =>
            STKindChecker.isServiceDeclaration(member)) as ServiceDeclaration[];
        let webHookType;
        services.forEach(service => {
            if ((service as ServiceDeclaration).absoluteResourcePath.find(resourcePath =>
                resourcePath.value === "calendar")) {
                webHookType = ConnectorType.G_CALENDAR;
            } else if ((service as ServiceDeclaration)?.expressions?.find(expression =>
                (expression as SimpleNameReference)?.name?.value === "githubWebhookListener")) {
                webHookType = ConnectorType.GITHUB;
            } else if ((webHookSyntaxTree).members?.find(member => (((member as ModuleVarDecl)?.
                typedBindingPattern?.bindingPattern) as CaptureBindingPattern)?.typeData?.
                typeSymbol?.moduleID?.moduleName === "sfdc")) {
                webHookType = ConnectorType.SALESFORCE;
            }
        });
        return webHookType as ConnectorType;
    }

    const handleWebhookEditOnComplete = () => {
        setdropDownC(undefined);
        handleOnComplete(TRIGGER_TYPE_WEBHOOK);
    }

    const handleEditClick = () => {
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
                activeConnectorType={getWebhookType()}
                onComplete={handleOnComplete}
                configData={getConfigDataFromSt(activeTriggerType, model as FunctionDefinition)}
            />
        );
        if (plusView) {
            plusView.isTriggerDropdown = true;
        }
        setShowDropDownC(true);
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

    let block: FunctionBodyBlock;
    if (model as FunctionDefinition) {
        const funcModel = model as FunctionDefinition;
        block = funcModel.functionBody as FunctionBodyBlock;
    }

    const text: string = (model.kind === "ModulePart") || !activeTriggerType
        ? "START"
        : activeTriggerType.toUpperCase();

    return (
        <g className="start-wrapper-edit">
            <StartSVG
                x={cx - (START_SVG_WIDTH_WITH_SHADOW / 2) + (DefaultConfig.dotGap / 3)}
                y={cy - (START_SVG_HEIGHT_WITH_SHADOW / 2)}
                text={text}
                showIcon={true}
                handleEdit={handleEditClick}
            />
            {block && initPlusAvailable && !showDropDownC && <PlusButton viewState={plusView} model={block} initPlus={true} />}
            <g>
                {showDropDownC && dropDownC}
            </g>
        </g>
    );
}
