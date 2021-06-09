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

import { LocalVarDecl, QualifiedNameReference } from "@ballerina/syntax-tree";
import { Divider } from "@material-ui/core";

import TooltipV2 from "../../../../../../../../components/TooltipV2";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { BallerinaConnectorsInfo } from "../../../../../../../../Definitions/lang-client-extended";
import { PlusViewState } from "../../../../../../../../Diagram/view-state/plus";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    START_CONNECTOR_ADD_INSIGHTS,
    START_EXISTING_CONNECTOR_ADD_INSIGHTS
} from "../../../../../../../models";
import { getConnectorIconSVG, getExistingConnectorIconSVG, getFormattedModuleName } from "../../../../../utils";
import { APIHeightStates } from "../../PlusElements";
import "../../style.scss";

// import { BetaSVG } from "./BetaSVG";

export interface APIOptionsProps {
    onSelect: (connector: BallerinaConnectorsInfo, selectedConnector: LocalVarDecl) => void;
    onChange?: (type: string, subType: string, connector?: BallerinaConnectorsInfo) => void;
    viewState?: PlusViewState;
    collapsed?: (value: APIHeightStates) => void
    // setAPIholderHeight?: (value: APIHeightStates) => void;
}

export interface ConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
}

export interface Connctors {
    connector: ConnctorComponent[];
    selectedCompoent: string;
}

export interface ExisitingConnctorComponent {
    connectorInfo: BallerinaConnectorsInfo;
    component: ReactNode;
    key: string;
}

export function APIOptions(props: APIOptionsProps) {
    const { state } = useContext(Context);
    const { connectors, stSymbolInfo, targetPosition, viewState, onEvent } = state;
    const { onSelect, collapsed } = props;
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
            placement: 'left'

        },
        smtpConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.SMTP.tooltip.title",
                defaultMessage: "Setup an email client to use the SMTP protocol."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.SMTP.tooltip.content",
                defaultMessage: "Send email messages"
            }),
            placement: 'right'
        },
        pop3Connector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.POP3.tooltip.title",
                defaultMessage: "Setup an email client to use the POP3 protocol."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.POP3.tooltip.content",
                defaultMessage: "Receive email messages"
            }),
            placement: 'left'
        },
        imapConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.title",
                defaultMessage: "Setup an email client to use the IMAP protocol.\
                NOTE : There can be vendor-specific security settings to be setup before using this connector."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.content",
                defaultMessage: "Receive email messages"
            }),
            actionText: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.actionText",
                defaultMessage: "Learn more..."
            }),
            actionLink: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.IMAP.tooltip.actionLink",
                defaultMessage: "https://wso2.com/choreo/docs/"
            }),
            placement: 'right'
        },
        gitHubConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GitHub.tooltip.title",
                defaultMessage: "Connect with GitHub API to perform operations in GitHub."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GitHub.tooltip.content",
                defaultMessage: "Create issues and pull requests"
            }),
            placement: 'left'
        },
        gmailConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.Gmail.tooltip.title",
                defaultMessage: "Connect with Gmail API to perform email operations."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.Gmail.tooltip.content",
                defaultMessage: "Send and receive email messages"
            }),
            placement: 'right'
        },
        gCalendarConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GCalendar.tooltip.title",
                defaultMessage: "Connect with Google Calendar API to perform operations in Google Calendar."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GCalendar.tooltip.content",
                defaultMessage: "Create events, Set reminders"
            }),
            placement: 'left'
        },
        gSheetConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GSheet.tooltip.title",
                defaultMessage: "Connect with Google Sheets API to perform operations in Google Sheets."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.GSheet.tooltip.content",
                defaultMessage: "Create and edit Google Sheets"
            }),
            placement: 'right'
        },
        slackConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.slack.tooltip.title",
                defaultMessage: "Connect with Slack API to perform operations in Slack."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.slack.tooltip.content",
                defaultMessage: "Post messages, Send files"
            }),
            placement: 'right'
        },
        twilioConnector: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.twilio.tooltip.title",
                defaultMessage: "Connect with Twilio API, and communicate with external services."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.twilio.tooltip.content",
                defaultMessage: "Send SMS, Make voice calls"
            }),
            placement: 'left'
        },
        netsuite: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.netsuite.tooltip.title",
                defaultMessage: "Connect with Netsuite API to perform Netsuite operations."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.netsuite.tooltip.content",
                defaultMessage: "Search customer details \nSearch transactions"
            }),
            placement: 'right'
        },
        salesforce: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.salesforce.tooltip.title",
                defaultMessage: "Connect with Salesforce API to perform Salesforce operations."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.salesforce.tooltip.content",
                defaultMessage: "Create records, Create leads"
            }),
            placement: 'left'
        },
        postgreSQL: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.postgreSQL.tooltip.title",
                defaultMessage: "Connect with PostgreSQL API to access data and perform operations in PostgreSQL"
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.postgreSQL.tooltip.content",
                defaultMessage: "Execute SQL queries"
            }),
            placement: 'right'
        },
        gDrive: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.gDrive.tooltip.title",
                defaultMessage: "Connect with Google Drive API to perform file management operations in Google Drive."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.gDrive.tooltip.content",
                defaultMessage: "Create file, Download file "
            }),
            placement: 'left'
        },
        gPeopleAPI: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.gPeopleAPI.tooltip.title",
                defaultMessage: "Connect with Google People API to perform contant management operations in Google People."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.gPeopleAPI.tooltip.content",
                defaultMessage: "Create contact, Modify contact"
            }),
            placement: 'right'
        },
        azureEventHub: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureEventHub.tooltip.title",
                defaultMessage: "Connect with Azure Event Hub to perform Event hub service operations."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureEventHub.tooltip.content",
                defaultMessage: "List partitions, Update event hub"
            }),
            placement: 'left'
        },
        azureCosmosDB: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureCosmosDB.tooltip.title",
                defaultMessage: "Connect with Azure Cosmos DB to perform database operations in Cosmos DB."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureCosmosDB.tooltip.content",
                defaultMessage: "Create document \nCreate stored procedure"
            }),
            placement: 'left'
        },
        azureFileService: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureFileService.tooltip.title",
                defaultMessage: "Connect with Azure Storage File Service to perform operations in Azure File Storage."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureFileService.tooltip.content",
                defaultMessage: "Create directory, Upload file"
            }),
            placement: 'left'
        },
        azureBlobService: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureBlobService.tooltip.title",
                defaultMessage: "Connect with Azure Blob to perform operations in Azure Blob Storage."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.azureBlobService.tooltip.content",
                defaultMessage: "Create blob, Update blob"
            }),
            placement: 'left'
        },
        mongoDB: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.mongoDB.tooltip.title",
                defaultMessage: "Connect with Mongo DB API to perform database operations."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.mongoDB.tooltip.content",
                defaultMessage: "Insert document, List collections"
            }),
            placement: 'right'
        },
        redis: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.redis.tooltip.title",
                defaultMessage: "Connect with Redis to perform operations on a Redis data source."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.redis.tooltip.content",
                defaultMessage: "Insert string value to a cache"
            }),
            placement: 'left'
        },
        AWSS3: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.AWSS3.tooltip.title",
                defaultMessage: "Connect with Amazon S3 API to manage Amzon S3 buckets and objects."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.AWSS3.tooltip.content",
                defaultMessage: "Create bucket, List objects"
            }),
            placement: 'right'
        },
        AWSSQS: {
            title: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.AWSSQS.tooltip.title",
                defaultMessage: "Connect with Amazon Simple Queue Service API to manage queues and messages."
            }),
            content: intl.formatMessage({
                id: "lowcode.develop.configForms.plusHolder.plusElements.connections.AWSSQS.tooltip.content",
                defaultMessage: "Create SQS queue, \nReceive a message from a SQS Queue"
            }),
            placement: 'left'
        },
    }
    // tslint:disable-next-line: no-shadowed-variable
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
        SALESFORCE: connectionsTooltipMessages.salesforce.title,
        POSTGRESQL: connectionsTooltipMessages.postgreSQL.title,
        NETSUITE: connectionsTooltipMessages.netsuite.title,
        "GOOGLE DRIVE": connectionsTooltipMessages.gDrive.title,
        "GOOGLE PEOPLE API": connectionsTooltipMessages.gPeopleAPI.title,
        "AZURE EVENTHUB": connectionsTooltipMessages.azureEventHub.title,
        "AZURE COSMOSDB": connectionsTooltipMessages.azureCosmosDB.title,
        "AZURE FILE SERVICE": connectionsTooltipMessages.azureFileService.title,
        "AZURE BLOB SERVICE": connectionsTooltipMessages.azureBlobService.title,
        "MONGO DB": connectionsTooltipMessages.mongoDB.title,
        "REDIS": connectionsTooltipMessages.redis.title,
        "AWS S3": connectionsTooltipMessages.AWSS3.title,
        "AWS SQS": connectionsTooltipMessages.AWSSQS.title,
    };

    // tslint:disable-next-line: no-shadowed-variable
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
        SALESFORCE: connectionsTooltipMessages.salesforce.content,
        POSTGRESQL: connectionsTooltipMessages.postgreSQL.content,
        NETSUITE: connectionsTooltipMessages.netsuite.content,
        "GOOGLE DRIVE": connectionsTooltipMessages.gDrive.content,
        "GOOGLE PEOPLE API": connectionsTooltipMessages.gPeopleAPI.content,
        "AZURE EVENTHUB": connectionsTooltipMessages.azureEventHub.content,
        "AZURE COSMOSDB": connectionsTooltipMessages.azureCosmosDB.content,
        "AZURE FILE SERVICE": connectionsTooltipMessages.azureFileService.content,
        "AZURE BLOB SERVICE": connectionsTooltipMessages.azureBlobService.content,
        "MONGO DB": connectionsTooltipMessages.mongoDB.content,
        "REDIS": connectionsTooltipMessages.redis.content,
        "AWS S3": connectionsTooltipMessages.AWSS3.content,
        "AWS SQS": connectionsTooltipMessages.AWSSQS.content,
    };

    const tooltipPlacement: Record<any, any> = {
        HTTP: connectionsTooltipMessages.httpConnector.placement,
        SMTP: connectionsTooltipMessages.smtpConnector.placement,
        POP3: connectionsTooltipMessages.pop3Connector.placement,
        IMAP: connectionsTooltipMessages.imapConnector.placement,
        TWILIO: connectionsTooltipMessages.twilioConnector.placement,
        GITHUB: connectionsTooltipMessages.gitHubConnector.placement,
        GMAIL: connectionsTooltipMessages.gmailConnector.placement,
        "GOOGLE CALENDAR": connectionsTooltipMessages.gCalendarConnector.placement,
        "GOOGLE SHEETS": connectionsTooltipMessages.gSheetConnector.placement,
        SLACK: connectionsTooltipMessages.slackConnector.placement,
        SALESFORCE: connectionsTooltipMessages.salesforce.placement,
        POSTGRESQL: connectionsTooltipMessages.postgreSQL.placement,
        NETSUITE: connectionsTooltipMessages.netsuite.placement,
        "GOOGLE DRIVE": connectionsTooltipMessages.gDrive.placement,
        "GOOGLE PEOPLE API": connectionsTooltipMessages.gPeopleAPI.placement,
        "AZURE EVENTHUB": connectionsTooltipMessages.azureEventHub.placement,
        "AZURE COSMOSDB": connectionsTooltipMessages.azureCosmosDB.placement,
        "AZURE FILE SERVICE": connectionsTooltipMessages.azureFileService.placement,
        "AZURE BLOB SERVICE": connectionsTooltipMessages.azureBlobService.placement,
        "MONGO DB": connectionsTooltipMessages.mongoDB.placement,
        "REDIS": connectionsTooltipMessages.redis.placement,
        "AWS S3": connectionsTooltipMessages.AWSS3.placement,
        "AWS SQS": connectionsTooltipMessages.AWSSQS.placement,
    };

    const [isToggledExistingConnector, setToggledExistingConnector] = useState(true);
    const [isToggledSelectConnector, setToggledSelectConnector] = useState(true);
    const [isExistingConnectorCollapsed, setExistingConnectorCollapsed] = useState(false);
    const [isSelectConnectorCollapsed, setSelectConnectorCollapsed] = useState(false);

    const isExistingConnectors = stSymbolInfo.endpoints && Array.from(stSymbolInfo.endpoints).length > 0;


    const toggleExistingCon = () => {
        setToggledExistingConnector(!isToggledExistingConnector);
        if (!isToggledExistingConnector) {
            // setExistingConnectorCollapsed(true);
            collapsed(APIHeightStates.ExistingConnectors);
        } else if (isToggledExistingConnector) {
            collapsed(APIHeightStates.ExistingConnectorsColapsed);
        }
    }

    const toggleSelectCon = () => {
        setToggledSelectConnector(!isToggledSelectConnector);
        if (!isToggledSelectConnector) {
            // setSelectConnectorCollapsed(true);
            collapsed(APIHeightStates.SelectConnectors);
        } else if (isToggledSelectConnector) {
            collapsed(APIHeightStates.SelectConnectorsColapsed);
        }
    }

    const onSelectConnector = (connector: BallerinaConnectorsInfo) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName
        };
        onEvent(event);
        onSelect(connector, undefined);
    }

    const onSelectExistingConnector = (connector: BallerinaConnectorsInfo, selectedConnector: LocalVarDecl) => {
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: START_EXISTING_CONNECTOR_ADD_INSIGHTS,
            property: connector.displayName
        };
        onEvent(event);
        onSelect(connector, selectedConnector);
    }

    const exsitingConnectorComponents: ExisitingConnctorComponent[] = [];
    const connectorComponents: ConnctorComponent[] = [];
    if (connectors) {
        connectors.forEach((connector: any, index: number) => {
            const placement = tooltipPlacement[connector.displayName.toUpperCase()]
            const tooltipTitle = tooltipTitles[connector.displayName.toUpperCase()];
            const tooltipExample = tooltipExamples[connector.displayName.toUpperCase()];
            const tolltipText = {
                "heading" : connector.displayName,
                "example" : tooltipExample,
                "content" : tooltipTitle
            }
            if (connector.displayName === "IMAP"){
                const tooltipAction = {
                    "link": connectionsTooltipMessages.imapConnector.actionLink,
                    "text": connectionsTooltipMessages.imapConnector.actionText
                }
                const component: ReactNode = (
                    <TooltipV2 type="info" text={tolltipText} action={tooltipAction} placement={placement} arrow={true} interactive={true} key={connector.displayName.toLowerCase()}>
                        <div className="connect-option" key={connector.displayName} onClick={onSelectConnector.bind(this, connector)} data-testid={connector.displayName.toLowerCase()}>
                            <div className="connector-details product-tour-add-http">
                                <div className="connector-icon">
                                    {getConnectorIconSVG(connector)}
                                </div>
                                <div className="connector-name">
                                    {connector.displayName}
                                </div>
                            </div>
                        </div>
                    </TooltipV2>
                );
                const connectorComponent: ConnctorComponent = {
                    connectorInfo: connector,
                    component
                }

                // filter connectors due to maintenance
                const filletedConnectors = ['azure_cosmosdb', 'azure_storage_service.files', 'azure_storage_service.blobs', 'asb'];
                if (!filletedConnectors.includes(connector.module)) {
                    connectorComponents.push(connectorComponent);
                }
            }
            else{
                const component: ReactNode = (
                    <TooltipV2 type="example" text={tolltipText} placement={placement} arrow={true} interactive={true} key={connector.displayName.toLowerCase()}>
                        <div className="connect-option" key={connector.displayName} onClick={onSelectConnector.bind(this, connector)} data-testid={connector.displayName.toLowerCase()}>
                            <div className="connector-details product-tour-add-http">
                                <div className="connector-icon">
                                    {getConnectorIconSVG(connector)}
                                </div>
                                <div className="connector-name">
                                    {connector.displayName}
                                </div>
                            </div>
                        </div>
                    </TooltipV2>
                );
                const connectorComponent: ConnctorComponent = {
                    connectorInfo: connector,
                    component
                }

                // filter connectors due to maintenance
                const filletedConnectors = ['azure_cosmosdb', 'azure_storage_service.files', 'azure_storage_service.blobs', 'mongodb'];
                if (!filletedConnectors.includes(connector.module)) {
                    connectorComponents.push(connectorComponent);
                }
            }
        });

        const getConnector = (moduleName: string, name: string): BallerinaConnectorsInfo => {
            // tslint:disable-next-line: no-unused-expression
            let returnConnnectorType;
            Array.from(connectors).forEach(element => {
                // tslint:disable-next-line: no-unused-expression
                const existingConnector = element as BallerinaConnectorsInfo;
                const formattedModuleName = getFormattedModuleName(existingConnector.module);
                if (formattedModuleName === moduleName && existingConnector.name === name) {
                    returnConnnectorType = existingConnector;
                }
            });
            return returnConnnectorType;
        }

        stSymbolInfo.endpoints.forEach((value: LocalVarDecl, key: string) => {
            const moduleName = (value.typedBindingPattern.typeDescriptor as QualifiedNameReference).modulePrefix.value;
            const name = (value.typedBindingPattern.typeDescriptor as QualifiedNameReference).identifier.value;
            const existConnector = getConnector(moduleName, name);
            const component: ReactNode = (
                <div className="existing-connect-option" key={key} onClick={onSelectExistingConnector.bind(this, existConnector, value)} data-testid={key.toLowerCase()}>
                    <div className="existing-connector-details product-tour-add-http">
                        <div className="existing-connector-icon">
                            {getExistingConnectorIconSVG(`${existConnector.module}_${existConnector.name}`)}
                        </div>
                        <div className="existing-connector-name">
                            {key}
                        </div>
                    </div>
                </div>
            );
            const exsitingConnectorComponent: ExisitingConnctorComponent = {
                connectorInfo: existConnector,
                component,
                key
            }
            // todo Connector filtering here
            // const connectorPosition = value.position;
            // const connectorClientViewState: ViewState = (model === null)
            //      ? blockViewState.draft[1]
            //      : model.viewState as StatementViewState;
            // const draftVS: any = connectorClientViewState as DraftStatementViewState;
            // const connectorTargetPosition = targetPosition as DraftInsertPosition;
            // if (connectorPosition.startLine > connectorTargetPosition.line) {
            //     exsitingConnectorComponents.push(exsitingConnectorComponent);
            // }
            exsitingConnectorComponents.push(exsitingConnectorComponent);
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
    const exsitingConnectors: ReactNode[] = [];
    if (selectedContName !== "") {
        const allCnts: ExisitingConnctorComponent[] = exsitingConnectorComponents.filter(el =>
            el.key.toLowerCase().includes(selectedContName.toLowerCase()));
        allCnts.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
        });
    } else {
        exsitingConnectorComponents.forEach((allCnt) => {
            exsitingConnectors.push(allCnt.component);
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
            {isExistingConnectors &&
                (
                    <div className="existing-connect-wrapper">
                        <div className="title-wrapper">
                            <p className="plus-section-title">Choose existing connection </p>
                            {isToggledSelectConnector ?
                                (
                                    <div onClick={toggleExistingCon} className="existing-connector-toggle">
                                        {isToggledExistingConnector ?
                                            <img src="../../../../../../images/exp-editor-expand.svg" />
                                            :
                                            <img src="../../../../../../images/exp-editor-collapse.svg" />
                                        }
                                    </div>
                                )
                                :
                                null
                            }
                        </div>

                        {isToggledExistingConnector &&
                            (
                                <div className="existing-connector-wrapper">
                                    {exsitingConnectors}
                                </div>
                            )
                        }
                    </div>
                )
            }

            <Divider />

            <div className="element-option-holder" >
                <div className="title-wrapper">
                    <p className="plus-section-title">Create new connection</p>
                    {isExistingConnectors && isToggledExistingConnector ?
                        (
                            <div onClick={toggleSelectCon}>
                                {isToggledSelectConnector ?
                                    <img src="../../../../../../images/exp-editor-expand.svg" />
                                    :
                                    <img src="../../../../../../images/exp-editor-collapse.svg" />
                                }
                            </div>
                        )
                        :
                        null
                    }
                </div>
                {isToggledSelectConnector &&
                    (
                        <>
                            <div className="top-connector-wrapper">
                                <input
                                    type="search"
                                    placeholder="Search"
                                    value={selectedContName}
                                    onChange={handleSearchChange}
                                    className='search-wrapper'
                                />
                            </div>
                            <div className="options-wrapper">
                                {/* {(genericConnectors.length > 0 ? <Divider /> : null)} */}
                                {genericConnectors}
                                {(serviceConnectors.length > 0 ? <Divider /> : null)}
                                {serviceConnectors}
                            </div>
                        </>
                    )
                }
            </div>
        </div>
    );
}
