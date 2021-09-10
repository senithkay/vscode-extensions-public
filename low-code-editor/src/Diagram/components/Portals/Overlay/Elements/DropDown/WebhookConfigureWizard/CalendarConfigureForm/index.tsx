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
// tslint:disable: jsx-wrap-multiline
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import {
    FunctionBodyBlock,
    FunctionDefinition,
    LocalVarDecl,
    MappingConstructor,
    ModulePart,
    ModuleVarDecl,
    QualifiedNameReference,
    SpecificField,
    STKindChecker,
    STNode
} from "@ballerina/syntax-tree";
import { Box, IconButton } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions";
import { Gcalendar } from "../../../../../../../../Definitions/connector";
import { AccountAvatar } from "../../../../../../../../Diagram/components/OauthConnectButton/AccountAvatar";
import { CirclePreloader } from "../../../../../../../../PreLoader/CirclePreloader";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../../models";
import { createPropertyStatement, updatePropertyStatement } from "../../../../../../../utils/modification-util";
import { ConnectionType, OauthConnectButton } from "../../../../../../OauthConnectButton";
import { FormAutocomplete } from "../../../../../ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { getKeyFromConnection } from "../../../../../utils";
import { SourceUpdateConfirmDialog } from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";
import EditDarkIcon from "../../../../../../../../assets/icons/EditDarkIcon";

interface CalendarConfigureFormProps {
    position: DiagramOverlayPosition;
    isTriggerTypeChanged: boolean;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function CalendarConfigureForm(props: CalendarConfigureFormProps) {
    const {
        props: {
            currentApp,
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
            stSymbolInfo,
            originalSyntaxTree
        },
        api: {
            insights: {
                onEvent,
            },
            code: {
                modifyTrigger,
                modifyDiagram,
            },
            data: {
                getGcalendarList
            }
        }
    } = useContext(Context);

    const { position, onComplete, currentConnection, isTriggerTypeChanged } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [activeConnection, setActiveConnection] = useState<ConnectionDetails>(currentConnection);
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    const [triggerChanged, setTriggerChanged] = useState(false);
    const [gcalenderList, setGcalenderList] = useState<Gcalendar[]>(undefined)
    const [calendarEvent, setCalendarEvent] = useState();
    const [isCalenderFetching, setIsCalenderFetching] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const Trigger = "Google Calendar";

    // HACK: hardcoded event list until get it form connector API
    const calenderEvents = ['onNewEvent', 'onEventUpdate', 'onEventDelete'];

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [isFileSaving, isFileSaved]);
    useEffect(() => {
        if (activeConnection) {
            setIsCalenderFetching(true);
            (async () => {
                const calendarList = await getGcalendarList(currentApp?.org, activeConnection.handle);
                setGcalenderList(calendarList);
                setIsCalenderFetching(false);
            })();
        }
    }, [activeConnection]);

    // handle oauth connect button callbacks
    function handleOnSelectConnection(type: ConnectionType, connection: ConnectionDetails) {
        if (type !== ConnectionType.NOT_CHANGED && connection) {
            setActiveConnection(connection);
        }
    }

    function handleOnDeselectConnection() {
        setActiveConnection(undefined);
    }

    function handleError() {
        setActiveConnection(undefined);
    }

    function getActiveGcalendar() {
        if (gcalenderList && activeGcalendar === null) {
            // select primary calender from list
            const calender = gcalenderList.find(calendar => calendar.primary === true);
            setActiveGcalendar(calender);
        }
        return activeGcalendar;
    }

    function handleItemLabel(gcalendar: Gcalendar) {
        return gcalendar.summary;
    }

    const handleGcalendarChange = (event: object, value: any) => {
        setActiveGcalendar(value);
    };

    const handleCalendarEventChange = (event: object, value: any) => {
        setCalendarEvent(value);
    };

    const getKeyFromCalConnection = (key: string) => {
        return activeConnection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key).codeVariableKey;
    };

    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };

    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createCalendarTrigger();
        } else if (!isTriggerTypeChanged) {
            updateCalendarTrigger();
        } else {
            setShowConfirmDialog(true);
        }
    };

    // handle trigger configure complete
    const createCalendarTrigger = () => {
        const clientId = getKeyFromCalConnection('clientIdKey');
        const clientSecret = getKeyFromCalConnection('clientSecretKey');
        const refreshUrl = getKeyFromCalConnection('tokenEpKey');
        const refreshToken = getKeyFromCalConnection('refreshTokenKey');

        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "gcalendar",
            PORT: 8090,
            CLIENT_ID: clientId,
            CLIENT_SECRET: clientSecret,
            REFRESH_URL: refreshUrl,
            REFRESH_TOKEN: refreshToken,
            CALENDAR_ID: activeGcalendar.id,
            EVENT: calendarEvent,
        });
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: "Google Calender"
        };
        onEvent(event);
    };

    // handle calendar trigger update
    const updateCalendarTrigger = () => {
        // get nodes to be edited
        const functionDefs = (originalSyntaxTree as ModulePart).members.filter(member =>
            STKindChecker.isFunctionDefinition(member)) as FunctionDefinition[];
        const initFunction: FunctionDefinition = functionDefs.find(functionDef =>
            functionDef.functionName.value === "init") as FunctionDefinition;

        let oauthConfigValExprNode: SpecificField;
        if (initFunction) {
            (initFunction.functionBody as FunctionBodyBlock).statements.forEach(statement => {
                if (STKindChecker.isLocalVarDecl(statement)) {
                    if (((statement as LocalVarDecl).typedBindingPattern?.typeDescriptor as
                        QualifiedNameReference)?.identifier?.value === "CalendarConfiguration") {
                        oauthConfigValExprNode = ((statement.initializer) as MappingConstructor).fields.find(field =>
                            (field as SpecificField).fieldName.value === "oauth2Config") as SpecificField;
                    }
                }

            })
        }
        const localVarDecls = (initFunction.functionBody as FunctionBodyBlock).statements.filter(statement =>
            STKindChecker.isLocalVarDecl(statement)) as LocalVarDecl[];
        let calIdNode: STNode;
        localVarDecls?.forEach(varDecl => {
            if (varDecl.initializer?.typeData?.typeSymbol?.name === "WatchResponse" &&
                STKindChecker.isCheckAction(varDecl.initializer)) {
                 calIdNode = varDecl.initializer.expression.arguments[0];
            }
        });

        // get configurable node if exists
        const clientIdKeyNode = stSymbolInfo.configurables.get(getKeyFromConnection(activeConnection, 'clientIdKey'));

        // connector Edit
        const modifications: STModification[] = [];

        if (oauthConfigValExprNode && calIdNode) {
            if (!clientIdKeyNode) {
                const initialConfigurable = (originalSyntaxTree as ModulePart).members.find(member =>
                    (member as ModuleVarDecl)?.qualifiers.find(qualifier =>
                        STKindChecker.isConfigurableKeyword(qualifier)));

                modifications.push(createPropertyStatement(`\nconfigurable string ${getKeyFromConnection(activeConnection, 'clientIdKey')} = ?;
                configurable string ${getKeyFromConnection(activeConnection, 'clientSecretKey')} = ?;
                configurable string ${getKeyFromConnection(activeConnection, 'refreshTokenKey')} = ?;
                configurable string ${getKeyFromConnection(activeConnection, 'tokenEpKey')} = ?;`,
                    {column: 0, line: initialConfigurable?.position?.startLine - 1 || 1}));
            }
            const clientId = getKeyFromCalConnection('clientIdKey');
            const clientSecret = getKeyFromCalConnection('clientSecretKey');
            const refreshToken = getKeyFromCalConnection('refreshTokenKey');
            const refreshUrl = getKeyFromCalConnection('tokenEpKey');

            const calConfigTemplate = `oauth2Config: {\n
                                         clientId: ${clientId},\n
                                         clientSecret: ${clientSecret},\n
                                         refreshUrl: ${refreshUrl},\n
                                         refreshToken: ${refreshToken}\n
                                      }`;
            modifications.push(updatePropertyStatement(calConfigTemplate, oauthConfigValExprNode.position));
            modifications.push(updatePropertyStatement(`"${activeGcalendar.id}"`, calIdNode.position));
            modifyDiagram(modifications);
            setTriggerChanged(true);
        }
    };

    const chooseCalendarPlaceholder = intl.formatMessage({
            id: "lowcode.develop.GCalendarConfigWizard.chooseCalendar.placeholder",
            defaultMessage: "Choose calendar"
        });

    const chooseEventPlaceholder = intl.formatMessage({
            id: "lowcode.develop.GCalendarConfigWizard.chooseEvent.placeholder",
            defaultMessage: "Choose Event"
        });

    const saveConfigButton = intl.formatMessage({
            id: "lowcode.develop.GCalendarConfigWizard.saveConfigButton.text",
            defaultMessage: "Save"
        });

    const activeConnectionLabel = () => (
        <>
            <div className={classes.activeConnectionWrapper}>
                <div className={classes.activeConnectionWrapperChild1}>
                    <Box border={1} borderRadius={5} className={classes.activeConnectionBox} key={activeConnection?.handle}>
                        <AccountAvatar connection={activeConnection}/>
                        <Typography variant="subtitle2">
                            <p className={classes.radioBtnSubtitle}>{activeConnection.userAccountIdentifier}</p>
                        </Typography>
                    </Box>
                </div>
                <div>
                    <IconButton
                        color="primary"
                        classes={ {
                            root: classes.changeConnectionBtn
                        } }
                        onClick={handleOnDeselectConnection}
                    >
                        <EditDarkIcon />
                    </IconButton>
                </div>
            </div>
        </>
    );

    return (
        <>
            { !activeConnection && (
                <div className={classes.customWrapper}>
                    <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GCalendarConfigWizard.googleConnection.title" defaultMessage="Google Connection"/></p>
                    <OauthConnectButton
                        connectorName={Trigger}
                        currentConnection={activeConnection}
                        onSelectConnection={handleOnSelectConnection}
                        onDeselectConnection={handleOnDeselectConnection}
                        onFailure={handleError}
                        isTriggerConnector={true}
                    />
                    <p/>
                </div>
            )}
            {activeConnection && activeConnectionLabel()}
            {activeConnection && isCalenderFetching && (
                <div className={classes.loader}>
                    <CirclePreloader position="relative" />
                    <Typography variant="subtitle2" className={classes.loaderTitle}>
                        <FormattedMessage id="lowcode.develop.GCalendarConfigWizard.fetchingCalendarsMessage.text" defaultMessage="Fetching calendars ..." />
                    </Typography>
                </div>

            ) }
            {activeConnection && !isCalenderFetching && gcalenderList && (
                <div className={classes.customWrapper}>
                    <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GCalendarConfigWizard.googleCalendar.title.text" defaultMessage="Google Calendar" /></p>
                    <FormAutocomplete
                        placeholder={chooseCalendarPlaceholder}
                        itemList={gcalenderList}
                        value={getActiveGcalendar()}
                        getItemLabel={handleItemLabel}
                        onChange={handleGcalendarChange}
                    />
                </div>
            ) }
            {activeGcalendar && activeConnection && (
                <div className={classes.customWrapper}>
                    <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GCalendarConfigWizard.googleCalendarEvent.title.text" defaultMessage="Event" /></p>
                    <FormAutocomplete
                        placeholder={chooseEventPlaceholder}
                        itemList={calenderEvents}
                        value={calendarEvent}
                        onChange={handleCalendarEventChange}
                    />
                </div>
            ) }

            { activeConnection && activeGcalendar && calendarEvent &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text={saveConfigButton}
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                )}

            { showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={createCalendarTrigger}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}
