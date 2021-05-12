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
import { TriggerType, TRIGGER_TYPE_API, TRIGGER_TYPE_INTEGRATION_DRAFT, TRIGGER_TYPE_MANUAL, TRIGGER_TYPE_SCHEDULE, TRIGGER_TYPE_SERVICE_DRAFT, TRIGGER_TYPE_WEBHOOK } from '../../../../../../models';
import { OverlayBackground } from '../../../../../OverlayBackground';
import Tooltip, { TooltipIcon } from '../../../../../../../components/Tooltip';
import { SourceUpdateConfirmDialog } from '../../SourceUpdateConfirmDialog';
import { ApiConfigureWizard } from '../ApiConfigureWizard';
import { ScheduleConfigureWizard } from '../ScheduleConfigureWizard';
import "../style.scss";
import { WebhookConfigureWizard } from '../WebhookConfigureWizard';

import { ManualIcon, ScheduleIcon, CalendarIcon, GitHubIcon, SalesforceIcon } from "../../../../../../../assets/icons";
import { FormattedMessage, useIntl } from 'react-intl';
import { getExistingConnectorIconSVG } from '../../../../utils';

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
    GMAIL = "Gmail",
    G_CALENDAR = "Google Calendar",
    G_SHEET = "Google Sheet",
    G_DRIVE = "Google Drive",
    SALESFORCE = "Salesforce",
    SLACK = "Slack",
    TWILIO = "Twilio",
}

export function TriggerDropDown(props: TriggerDropDownProps) {
    const { state } = useContext(DiagramContext);
    const intl = useIntl();
    const { isMutationProgress: isFileSaving, isLoadingSuccess: isFileSaved, onModifyTrigger } = state;
    const { onClose, onComplete, title = "Select Trigger",
            position, isEmptySource, triggerType, configData /*, createTrigger*/ } = props;

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
    }
    function handleSubMenuClose() {
        setSelectedTrigger(undefined);
        setActiveConnector(undefined);
    }

    const triggerDropDownTooltipMessages = {
        triggerSelector: {
        title: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.selectTrigger.tooltip.title",
            defaultMessage: "Select a suitable trigger. A trigger is an event or an action that causes a Choreo application to start executing."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.selectTrigger.tooltip.actionText",
            defaultMessage: "Learn about triggers"
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.selectTrigger.tooltip.actionTitle",
            defaultMessage: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md"
        })
    }
    };

    const scheduleTriggerTooltipMessages = {
        scheduleTrigger: {
        title: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.scheduleTrigger.tooltip.title",
            defaultMessage: "To trigger an application according to a given schedule."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.scheduleTrigger.tooltip.actionText",
            defaultMessage: "Learn about the schedule trigger."
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.scheduleTrigger.tooltip.actionTitle",
            defaultMessage: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#3--schedule"
        })
    }
    };

    const manualTriggerTooltipMessages = {
        manualTrigger: {
        title: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.manualTrigger.tooltip.title",
            defaultMessage: "To create an application that can be triggered manually by clicking 'Run & Test'."
        }),
        actionText: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.manualTrigger.tooltip.actionText",
            defaultMessage: "Learn about the manual trigger."
        }),
        actionLink: intl.formatMessage({
            id: "lowcode.develop.triggerDropDown.manualTrigger.tooltip.actionTitle",
            defaultMessage: "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#2-Manual"
        })
    }
    };

    const getConnectorTriggerButton = (connector: ConnectorType, iconId: string, tooltipTitle: string, actionText: string, actionLink: string, label?: string) => {
        const shortName = connector.replace(/ /gi, '').toLowerCase();
        const triggerTooltipMessages = {
            title: intl.formatMessage({
                id: `lowcode.develop.triggerDropDown.${shortName}Trigger.tooltip.title`,
                defaultMessage: tooltipTitle
            }),
            actionText: intl.formatMessage({
                id: `lowcode.develop.triggerDropDown.${shortName}Trigger.tooltip.actionText`,
                defaultMessage: actionText
            }),
            actionLink: intl.formatMessage({
                id: `lowcode.develop.triggerDropDown.${shortName}Trigger.tooltip.actionTitle`,
                defaultMessage: actionLink
            })
        };

        return (
            <Tooltip
                title={triggerTooltipMessages.title}
                actionText={triggerTooltipMessages.actionText}
                actionLink={triggerTooltipMessages.actionLink}
                interactive={true}
                placement="left"
                arrow={true}
            >
                <div
                    className={cn("trigger-wrapper", { "active": (activeConnector === connector) })}
                    onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_WEBHOOK, connector)}
                >
                    <div className="icon-wrapper">
                        <div className="trigger-selector-icon">
                            {getExistingConnectorIconSVG(iconId)}
                        </div>
                    </div>
                    <div className="trigger-label "><FormattedMessage id={`lowcode.develop.triggerDropDown.${shortName}.title`} defaultMessage={label || connector} /></div>
                </div>
            </Tooltip>
        );
    }

    const integrationMenu = (
        <div>
            <DiagramOverlay className={"trigger-container"} position={position}>
                <div>
                    <div className="trigger-title-wrap">
                        <p>{title}</p>
                        <div>
                            <TooltipIcon
                                title={triggerDropDownTooltipMessages.triggerSelector.title}
                                actionText={triggerDropDownTooltipMessages.triggerSelector.actionText}
                                actionLink={triggerDropDownTooltipMessages.triggerSelector.actionLink}
                                interactive={true}
                                arrow={true}
                            />
                        </div>
                    </div>
                    {(triggerType !== undefined && triggerType !== TRIGGER_TYPE_INTEGRATION_DRAFT && triggerType !== TRIGGER_TYPE_SERVICE_DRAFT) && (
                        <button className="close-btn" onClick={onClose}>
                            <CloseIcon />
                        </button>
                    )}
                    <hr className={"trigger-title-underline"} />
                    <div className={"trigger-list"}>
                        <Tooltip
                            title={scheduleTriggerTooltipMessages.scheduleTrigger.title}
                            actionText={scheduleTriggerTooltipMessages.scheduleTrigger.actionText}
                            actionLink={scheduleTriggerTooltipMessages.scheduleTrigger.actionLink}
                            interactive={true}
                            placement="left"
                            arrow={true}
                        >
                            <div
                                className={cn("trigger-wrapper", { "active": selectedTrigger === TRIGGER_TYPE_SCHEDULE })}
                                onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_SCHEDULE)}
                            >
                                <div className="icon-wrapper">
                                    <ScheduleIcon className="trigger-selector-icon" />
                                </div>
                                <div className="trigger-label "><FormattedMessage id="lowcode.develop.triggerDropDown.schedule.title" defaultMessage="Schedule" /></div>
                            </div>
                        </Tooltip>

                        <Tooltip
                            title={manualTriggerTooltipMessages.manualTrigger.title}
                            actionText={manualTriggerTooltipMessages.manualTrigger.actionText}
                            actionLink={manualTriggerTooltipMessages.manualTrigger.actionLink}
                            interactive={true}
                            placement="right"
                            arrow={true}
                        >
                            <div
                                className={cn("trigger-wrapper", { "active": selectedTrigger === TRIGGER_TYPE_MANUAL })}
                                onClick={handleTriggerChange.bind(this, TRIGGER_TYPE_MANUAL)}
                            >
                                <div className="icon-wrapper">
                                    <ManualIcon className="trigger-selector-icon" />
                                </div>
                                <div className="trigger-label "><FormattedMessage id="lowcode.develop.triggerDropDown.manual.title" defaultMessage="Manual" /></div>
                            </div>
                        </Tooltip>

                        { getConnectorTriggerButton(
                            ConnectorType.GITHUB,
                            'github_Client',
                            "To trigger an application based on GitHub events.",
                            "Learn about the GitHub trigger.",
                            "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#5-GitHub"
                        ) }

                        {/* { getConnectorTriggerButton(
                            ConnectorType.GMAIL,
                            'googleapis_gmail_Client',
                            "To trigger an application based on GMail events.",
                            "Learn about the GMail trigger.",
                            "#",
                        ) } */}

                        { getConnectorTriggerButton(
                            ConnectorType.G_CALENDAR,
                            'googleapis_calendar_Client',
                            "To trigger an application based on Google Calendar events.",
                            "Learn about the calendar trigger.",
                            "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md#4-calendar",
                            "Calender"
                        ) }

                        { getConnectorTriggerButton(
                            ConnectorType.G_SHEET,
                            'googleapis_sheets_Sheet',
                            "To trigger an application based on Google Sheet events.",
                            "Learn about the sheet trigger.",
                            "#",
                            "Sheet"
                        ) }

                        {/* { getConnectorTriggerButton(
                            ConnectorType.G_DRIVE,
                            'googleapis_drive_Client',
                            "To trigger an application based on Google Drive events.",
                            "Learn about the google drive trigger.",
                            "#",
                            "Drive"
                        ) } */}

                        { getConnectorTriggerButton(
                            ConnectorType.SALESFORCE,
                            'sfdc_Client',
                            "To trigger an application based on Salesforce events.",
                            "Learn about the Salesforce trigger.",
                            "https://github.com/wso2/choreo-docs/blob/master/portal-docs/trigger.md",
                        ) }


                    </div>
                </div>
            </DiagramOverlay>
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
            {showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={handleDialogOnUpdate}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </div>
    );

    return (
        <DiagramOverlayContainer forceRender={true}>
            {(selectedTrigger === TRIGGER_TYPE_MANUAL || selectedTrigger === TRIGGER_TYPE_SCHEDULE || selectedTrigger === TRIGGER_TYPE_WEBHOOK || selectedTrigger === TRIGGER_TYPE_INTEGRATION_DRAFT) &&
                integrationMenu
            }

            {(selectedTrigger === TRIGGER_TYPE_API || selectedTrigger === TRIGGER_TYPE_SERVICE_DRAFT) && (
                <ApiConfigureWizard
                    position={{ x: position.x, y: position.y }}
                    onWizardComplete={handleTriggerComplete}
                    onClose={onClose}
                    path={configData?.path}
                    method={configData?.method}
                    triggerType={selectedTrigger}
                />
            )}

            {triggerType !== undefined && <OverlayBackground />}
        </DiagramOverlayContainer>
    );
}
