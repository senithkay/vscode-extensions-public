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
// tslint:disable: ordered-imports
import React, { useContext, useEffect, useState } from 'react';

import CloseIcon from "@material-ui/icons/Close";
import cn from "classnames";

import { DiagramOverlay, DiagramOverlayContainer, DiagramOverlayPosition } from '../../..';
import { Context as DiagramContext } from '../../../../../../../Contexts/Diagram';
import { TriggerType, TRIGGER_TYPE_API, TRIGGER_TYPE_MANUAL, TRIGGER_TYPE_SCHEDULE, TRIGGER_TYPE_WEBHOOK } from '../../../../../../models';
import { DefaultConfig } from '../../../../../../visitors/default';
import { OverlayBackground } from '../../../../../OverlayBackground';
import Tooltip, { TooltipIcon } from '../../../../ConfigForm/Elements/Tooltip';
import { tooltipMessages } from '../../../../utils/constants';
import { SourceUpdateConfirmDialog } from '../../SourceUpdateConfirmDialog';
import { ApiConfigureWizard } from '../ApiConfigureWizard';
import { ScheduleConfigureWizard } from '../ScheduleConfigureWizard';
import "../style.scss";
import { WebhookConfigureWizard } from '../WebhookConfigureWizard';

import { ApiIcon, ManualIcon, ScheduleIcon, CalendarIcon, GitHubIcon } from "../../../../../../../assets/icons";
import {FunctionDefinition, STNode} from "@ballerina/syntax-tree";
import {diagramSyntaxTreeMutationStart} from "components/DiagramEditor/utils";

interface TriggerDropDownProps {
    position: DiagramOverlayPosition;
    title?: string;
    onClose?: () => void;
    onComplete?: (newTrigger?: TriggerType) => void;
    // dispatchGoToNextTourStep: (nextStepId: string) => void;
    isEmptySource?: boolean;
    triggerType?: TriggerType;
    configData?: any;
    isDropdownActive?: boolean;
    // createTrigger: (triggerType: TriggerType, model?: any, configObject?: any) => void; // todo: handle dispatch
}

export enum ConnectorType {
    GITHUB = "GitHub",
    G_CALENDAR = "Google Calender",
    G_SHEET = "Google Sheet",
}

export function TriggerDropDown(props: TriggerDropDownProps) {
    const { state } = useContext(DiagramContext);
    const { isMutationProgress: isFileSaving, isLoadingSuccess: isFileSaved, onModifyTrigger } = state;
    const { onClose, onComplete, title = "Trigger selector",
            position, isEmptySource, triggerType, configData, /*, createTrigger*/ } = props;

    const [activeConnector, setActiveConnector] = useState<ConnectorType>(undefined);
    const [selectedTrigger, setSelectedTrigger] = useState<TriggerType>(triggerType);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [triggerChanged, setTriggerChanged] = useState(false);

    useEffect(() => {
        if (triggerChanged && !isFileSaving && isFileSaved) {
            onComplete(selectedTrigger);
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);

    const handleTriggerChange = (newTrigger: TriggerType, connector?: ConnectorType) => {
        setSelectedTrigger(newTrigger);
        setActiveConnector((Object.values(ConnectorType).includes(connector)) ? connector : undefined);
        setTriggerChanged(true);

        // if (newTrigger === TRIGGER_TYPE_API) {
        //     dispatchGoToNextTourStep("SELECT_TRIGGER");
        // }
        if (newTrigger === TRIGGER_TYPE_MANUAL) {
            if (isEmptySource) {
                // todo: handle dispatch
                onModifyTrigger(newTrigger);
            } else {
                // get user confirmation if code there
                setShowConfirmDialog(true);
            }
        }
    };

    const handleDialogOnUpdate = () => {
        // todo: handle dispatch
        onModifyTrigger(selectedTrigger);
    };
    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };
    function handleTriggerComplete() {
        onComplete(selectedTrigger);
    };
    function handleSubMenuClose() {
        setSelectedTrigger(undefined);
        setActiveConnector(undefined);
    };

    return (
        <DiagramOverlayContainer forceRender={true}>
            <DiagramOverlay
                className={"trigger-container"}
                position={position}
            >
                <div>
                    <div className="trigger-title-wrap">
                        <p>{title}</p>
                        <div>
                            <TooltipIcon
                                title={tooltipMessages.triggerSelector.title}
                                actionText={tooltipMessages.triggerSelector.actionText}
                                actionLink={tooltipMessages.triggerSelector.actionLink}
                                interactive={true}
                                arrow={true}
                            />
                        </div>
                    </div>
                    {triggerType !== undefined && (
                        <button className="close-btn" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    )}
                    <hr className={"trigger-title-underline"} />
                    <div className={"trigger-list"}>
                        <div>
                            <Tooltip
                                title={tooltipMessages.apiTrigger.title}
                                actionText={tooltipMessages.apiTrigger.actionText}
                                actionLink={tooltipMessages.apiTrigger.actionLink}
                                interactive={true}
                                placement="left"
                                arrow={true}
                            >
                                <div
                                    className={cn("trigger-wrapper", "product-tour-new-api", { "active": selectedTrigger === TRIGGER_TYPE_API })}
                                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_API)}
                                    data-testid="api-trigger"
                                >
                                    <div className="icon-wrapper">
                                        <ApiIcon className="trigger-selector-icon" />
                                    </div>
                                    <div className="trigger-label">API</div>
                                </div>
                            </Tooltip>

                            <Tooltip
                                title={tooltipMessages.manualTrigger.title}
                                actionText={tooltipMessages.manualTrigger.actionText}
                                actionLink={tooltipMessages.manualTrigger.actionLink}
                                interactive={true}
                                placement="left"
                                arrow={true}
                            >
                                <div
                                    className={cn("trigger-wrapper", { "active": selectedTrigger === TRIGGER_TYPE_MANUAL })}
                                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_MANUAL)}
                                >
                                    <div className="icon-wrapper">
                                        <ManualIcon className="trigger-selector-icon" />
                                    </div>
                                    <div className="trigger-label "> Manual </div>
                                </div>
                            </Tooltip>

                            <Tooltip
                                title={tooltipMessages.gitHubTrigger.title}
                                actionText={tooltipMessages.gitHubTrigger.actionText}
                                actionLink={tooltipMessages.gitHubTrigger.actionLink}
                                interactive={true}
                                placement="left"
                                arrow={true}
                            >
                                <div
                                    className={cn("trigger-wrapper", { "active": (activeConnector === ConnectorType.GITHUB) })}
                                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_WEBHOOK, ConnectorType.GITHUB)}
                                >
                                    <div className="icon-wrapper">
                                        <GitHubIcon className="trigger-selector-icon" />
                                    </div>
                                    <div className="trigger-label ">GitHub</div>
                                </div>
                            </Tooltip>
                        </div>

                        <div>
                            <Tooltip
                                title={tooltipMessages.scheduleTrigger.title}
                                actionText={tooltipMessages.scheduleTrigger.actionText}
                                actionLink={tooltipMessages.scheduleTrigger.actionLink}
                                interactive={true}
                                placement="right"
                                arrow={true}
                            >
                                <div
                                    className={cn("trigger-wrapper", { "active": selectedTrigger === TRIGGER_TYPE_SCHEDULE })}
                                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_SCHEDULE)}
                                >
                                    <div className="icon-wrapper">
                                        <ScheduleIcon className="trigger-selector-icon" />
                                    </div>
                                    <div className="trigger-label ">  Schedule </div>
                                </div>
                            </Tooltip>
                            {/* INFO:webhook trigger has been removed */}
                            <Tooltip
                                title={tooltipMessages.calenderTrigger.title}
                                actionText={tooltipMessages.calenderTrigger.actionText}
                                actionLink={tooltipMessages.calenderTrigger.actionLink}
                                interactive={true}
                                placement="right"
                                arrow={true}
                            >
                                <div
                                    className={cn("trigger-wrapper", { "active": (activeConnector === ConnectorType.G_CALENDAR) })}
                                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_WEBHOOK, ConnectorType.G_CALENDAR)}
                                >
                                    <div className="icon-wrapper">
                                        <CalendarIcon className="trigger-selector-icon" />
                                    </div>
                                    <div className="trigger-label "> Calender </div>
                                </div>
                            </Tooltip>
                        </div>
                    </div>
                </div>

            </DiagramOverlay>

            {selectedTrigger === TRIGGER_TYPE_API && (
                <ApiConfigureWizard
                    position={{ x: position.x, y: position.y + 10 }}
                    onWizardComplete={handleTriggerComplete}
                    onClose={handleSubMenuClose}
                    path={configData?.path}
                    method={configData?.method}
                />
            )}
            {selectedTrigger === TRIGGER_TYPE_SCHEDULE && (
                <ScheduleConfigureWizard
                    position={{ x: position.x, y: position.y + 10 }}
                    onWizardComplete={handleTriggerComplete}
                    onClose={handleSubMenuClose}
                    cron={configData?.cron}
                />
            )}
            {selectedTrigger === TRIGGER_TYPE_WEBHOOK && activeConnector !== undefined && (
                <WebhookConfigureWizard
                    position={{ x: position.x, y: position.y + 10 }}
                    connector={activeConnector}
                    onWizardComplete={handleTriggerComplete}
                    onClose={handleSubMenuClose}
                />
            )}
            { showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    position={{
                        x: position.x + DefaultConfig.configureWizardOffset.x,
                        y: position.y + DefaultConfig.configureWizardOffset.y
                    }}
                    onConfirm={handleDialogOnUpdate}
                    onCancel={handleDialogOnCancel}
                />
            )}
            {triggerType !== undefined && <OverlayBackground />}

        </DiagramOverlayContainer>
    );
}

// const mapDispatchToProps = {
//     createTrigger: dispatchModifyTriggerWizard,
// }; // todo: handle dispatch function

// export const TriggerDropDown = connect(null, mapDispatchToProps)(TriggerDropDownC);
