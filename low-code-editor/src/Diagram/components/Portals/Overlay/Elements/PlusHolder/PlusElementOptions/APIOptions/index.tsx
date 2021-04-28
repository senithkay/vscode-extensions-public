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
import React, { ReactNode, useContext, useState } from "react";
import { useIntl } from "react-intl";

import Divider from "@material-ui/core/Divider/Divider";

import Tooltip from "../../../../../../../../components/Tooltip";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../../Definitions/lang-client-extended";
import { getConnectorIconSVG } from "../../../../../utils";
import "../../style.scss";

// import { BetaSVG } from "./BetaSVG";

export interface APIOptionsProps {
    onSelect: (connector: BallerinaConnectorsInfo) => void;
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export function APIOptions(props: APIOptionsProps) {
    const { state } = useContext(DiagramContext);
    const { connectors } = state;
    const { onSelect } = props;
    const [selectedContName, setSelectedContName] = useState("");
    const intl = useIntl();

    const connectionsTooltipMessages = {
        httpConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.HTTP.tooltip.title",
                defaultMessage: "Communicate with external endpoints using the HTTP protocol."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.HTTP.tooltip.content",
                defaultMessage: "Send a GET or POST request"
            }),
    },
        smtpConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.SMTP.tooltip.title",
            defaultMessage: "Setup an email client to use the SMTP protocol."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.SMTP.tooltip.content",
            defaultMessage: "Send emails through the app"
        }),
    },
        pop3Connector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.POP3.tooltip.title",
            defaultMessage: "Setup an email client to use the POP3 protocol."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.POP3.tooltip.content",
            defaultMessage: "Receive emails through the app"
        }),
    },
        imapConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.title",
            defaultMessage: "Setup an email client to use the IMAP protocol"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.content",
            defaultMessage: "Receive emails through the app"
        }),
    },
        gitHubConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GitHub.tooltip.title",
            defaultMessage: "Connect your application with the GitHub API to perform operations in GitHub."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GitHub.tooltip.content",
            defaultMessage: "Create issues"
        }),
    },
        gmailConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.Gmail.tooltip.title",
            defaultMessage: "Connect your application with the Gmail API"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.Gmail.tooltip.content",
            defaultMessage: "Send and receive emails"
        }),
    },
        gCalendarConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GCalendar.tooltip.title",
            defaultMessage: "Connect your application with the Google Calendar API."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GCalendar.tooltip.content",
            defaultMessage: "Create events, Set reminders"
        }),
    },
        gSheetConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GSheet.tooltip.title",
            defaultMessage: "Connect your application with Google Sheets API"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GSheet.tooltip.content",
            defaultMessage: "Create and edit Google Sheets"
        }),
    },
        slackConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.slack.tooltip.title",
            defaultMessage: "Connect your application with the Slack API."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.slack.tooltip.content",
            defaultMessage: "Post messages, send files"
        }),
    },
        twilioConnector: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.twilio.tooltip.title",
            defaultMessage: "Connect your application with the Twilio API, and communicate with external services."
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.twilio.tooltip.content",
            defaultMessage: "Send SMS, Make voice calls, etc."
        }),
    },
        netsuite: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.netsuite.tooltip.title",
            defaultMessage: "Connect your application with the Netsuite API to perform Netsuite operations"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.netsuite.tooltip.content",
            defaultMessage: "Search customer details \nSearch transactions"
        }),
    },
        salesforce: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.salesforce.tooltip.title",
            defaultMessage: "Connect your application with the Salesforce API to perform Salesforce operations"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.salesforce.tooltip.content",
            defaultMessage: "Create and update records"
        }),
    },
        postgreSQL: {
        title: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.postgreSQL.tooltip.title",
            defaultMessage: "Connect your application with PostgreSQL API"
        }),
        content: intl.formatMessage({
            id: "lowcode.develop.configForms.plusHolder.plusElements.connections.postgreSQL.tooltip.content",
            defaultMessage: "Execute SQL queries"
        }),
    },
    }
    const tooltipTitles: Record<any, string> = {
        HTTP: connectionsTooltipMessages.httpConnector.title,
        SMTP: connectionsTooltipMessages.smtpConnector.title,
        POP3: connectionsTooltipMessages.pop3Connector.title,
        IMAP: connectionsTooltipMessages.imapConnector.title,
        TWILIO: connectionsTooltipMessages.twilioConnector.title,
        GITHUB: connectionsTooltipMessages.gitHubConnector.title,
        GMAIL: connectionsTooltipMessages.gmailConnector.title,
        "GOOGLE CALENDAR": connectionsTooltipMessages.gCalendarConnector.title,
        "GOOGLE SHEETS": connectionsTooltipMessages.gSheetConnector.title,
        SLACK: connectionsTooltipMessages.slackConnector.title,
        SALESFORCE : connectionsTooltipMessages.salesforce.title,
        POSTGRESQL : connectionsTooltipMessages.postgreSQL.title,
        NETSUITE : connectionsTooltipMessages.netsuite.title,
    };

    const tooltipExamples: Record<any, string> = {
        HTTP: connectionsTooltipMessages.httpConnector.content,
        SMTP: connectionsTooltipMessages.smtpConnector.content,
        POP3: connectionsTooltipMessages.pop3Connector.content,
        IMAP: connectionsTooltipMessages.imapConnector.content,
        TWILIO: connectionsTooltipMessages.twilioConnector.content,
        GITHUB: connectionsTooltipMessages.gitHubConnector.content,
        GMAIL: connectionsTooltipMessages.gmailConnector.content,
        "GOOGLE CALENDAR": connectionsTooltipMessages.gCalendarConnector.content,
        "GOOGLE SHEETS": connectionsTooltipMessages.gSheetConnector.content,
        SLACK: connectionsTooltipMessages.slackConnector.content,
        SALESFORCE : connectionsTooltipMessages.salesforce.content,
        POSTGRESQL : connectionsTooltipMessages.postgreSQL.content,
        NETSUITE : connectionsTooltipMessages.netsuite.content,
    };

    const connectorComponents: ConnctorComponent[] = [];
    if (connectors) {
        connectors.forEach((connector: any, index: number) => {
            const placement = index % 2 === 0 ? 'left' : 'right';
            const tooltipTitle = tooltipTitles[connector.displayName.toUpperCase()];
            const tooltipExample = tooltipExamples[connector.displayName.toUpperCase()];
            const component: ReactNode = (
                <Tooltip title={tooltipTitle} placement={placement} arrow={true} example={true} interactive={true} codeSnippet={true} content={tooltipExample}>
                    <div className="connect-option" key={connector.displayName} onClick={onSelect.bind(this, connector)} data-testid={connector.displayName.toLowerCase()}>
                        <div className="connector-details product-tour-add-http">
                            <div className="connector-icon">
                                {getConnectorIconSVG(connector)}
                            </div>
                            <div className="connector-name">
                                {connector.displayName}
                            </div>
                            {/* <div className="beta-btn-wrapper">
                                {(connector.beta) && <BetaSVG />}
                            </div> */}
                        </div>
                    </div>
                </Tooltip>
            );
            const connectorComponent: ConnctorComponent = {
                connectorInfo: connector,
                component
            }
            connectorComponents.push(connectorComponent);
        });
    }

    const handleSearchChange = (evt: any) => {
        setSelectedContName(evt.target.value);
    };

    const genericConnectors: ReactNode[] = [];
    const serviceConnectors: ReactNode[] = [];
    if (selectedContName !== "") {
        const allCnts: ConnctorComponent[] = connectorComponents.filter(el =>
            el.connectorInfo.displayName.toLowerCase().includes(selectedContName.toLowerCase()));
        allCnts.forEach((allCnt) => {
            if (allCnt.connectorInfo.category === "generic-connectors") {
                genericConnectors.push(allCnt.component);
            } else if (allCnt.connectorInfo.category === "service-connectors") {
                serviceConnectors.push(allCnt.component);
            }
        });
    } else {
        connectorComponents.forEach((allCnt) => {
            if (allCnt.connectorInfo.category === "generic-connectors") {
                genericConnectors.push(allCnt.component);
            } else if (allCnt.connectorInfo.category === "service-connectors") {
                serviceConnectors.push(allCnt.component);
            }
        });
    }

    const chooseFromListLabel = intl.formatMessage({
        id: "lowcode.develop.elements.plusHolder.APIoptions.chooseFromList.label",
        defaultMessage: "Select from list"
    });

    const searchPlaceholder = intl.formatMessage({
        id: "lowcode.develop.elements.plusHolder.APIoptions.search.placeholder",
        defaultMessage: "Search"
    });

    return (
        <div className="connector-option-holder" >
            <div className="search-options-wrapper">
                <label>{chooseFromListLabel}</label>
            </div>
            <div className="top-connector-wrapper">
                <input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={selectedContName}
                    onChange={handleSearchChange}
                    className='search-wrapper'
                />
            </div>
            <div className="element-option-holder" >
                <div className="options-wrapper">
                    {(genericConnectors.length > 0 ? <Divider /> : null)}
                    {genericConnectors}
                    {(serviceConnectors.length > 0 ? <Divider /> : null)}
                    {serviceConnectors}
                </div>
            </div>
        </div>
    );
}
