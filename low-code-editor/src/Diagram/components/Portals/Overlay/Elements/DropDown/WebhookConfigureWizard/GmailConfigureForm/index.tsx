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
    FunctionDefinition, LocalVarDecl, MappingConstructor,
    ModulePart,
    ModuleVarDecl,
    QualifiedNameReference, SpecificField,
    STKindChecker, STNode
} from "@ballerina/syntax-tree";
import Typography from "@material-ui/core/Typography";

import { DiagramOverlayPosition } from "../../../..";
import { ConnectionDetails } from "../../../../../../../../api/models";
import { Context as DiagramContext } from "../../../../../../../../Contexts/Diagram";
import { STModification } from "../../../../../../../../Definitions";
import { Gcalendar } from "../../../../../../../../Definitions/connector";
import { CirclePreloader } from "../../../../../../../../PreLoader/CirclePreloader";
import { TRIGGER_TYPE_WEBHOOK } from "../../../../../../../models";
import { createPropertyStatement, updatePropertyStatement } from "../../../../../../../utils/modification-util";
import { ConnectionType, OauthConnectButton } from "../../../../../../OauthConnectButton";
import { FormAutocomplete } from "../../../../../ConfigForm/Elements/Autocomplete";
import { PrimaryButton } from "../../../../../ConfigForm/Elements/Button/PrimaryButton";
import { getKeyFromConnection } from "../../../../../utils";
import { useStyles } from "../../styles";

interface GmailConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function GmailConfigureForm(props: GmailConfigureFormProps) {
    const { state } = useContext(DiagramContext);
    const {
        isMutationProgress: isFileSaving,
        isLoadingSuccess: isFileSaved,
        syntaxTree,
        onModify: dispatchModifyTrigger,
        trackTriggerSelection,
        currentApp,
        getGcalendarList,
        stSymbolInfo,
        originalSyntaxTree,
        onMutate: dispatchMutations
    } = state;
    const model: FunctionDefinition = syntaxTree as FunctionDefinition;
    const body: FunctionBodyBlock = model?.functionBody as FunctionBodyBlock;
    const { position, onComplete, currentConnection } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [activeConnection, setActiveConnection] = useState<ConnectionDetails>(currentConnection);
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    const [triggerChanged, setTriggerChanged] = useState(false);
    const [gmailList, setGmailList] = useState(undefined)
    const [gmailEvent, setGmailEvent] = useState<string>();
    const [isCalenderFetching, setIsCalenderFetching] = useState(false);
    const Trigger = "Google Gmail";

    // HACK: hardcoded event list until get it form connector API
    const gmailEvents = {
        onNewEmail : {
            type: "gmail:Message",
            variable: "message"
        },
        onNewThread : {
            type: "gmail:MailThread",
            variable: "thread"
        },
        onNewAttachment : {
            type: "gmailListener:MailAttachment",
            variable: "attachment"
        },
        onNewLabeledEmail : {
            type: "gmailListener:ChangedLabel",
            variable: "changedLabeldMsg"
        },
        onNewStarredEmail : {
            type: "gmail:Message",
            variable: "message"
        },
        onLabelRemovedEmail : {
            type: "gmailListener:ChangedLabel",
            variable: "changedLabeldMsg"
        },
        onStarRemovedEmail : {
            type: "gmail:Message",
            variable: "message"
        },
    };

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
                const mailList = await getGcalendarList(currentApp?.org, activeConnection.handle);
                setGmailList(mailList);
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
    // function getActiveGcalendar() {
    //     if (gmailList && activeGcalendar === null) {
    //         // select primary gmail from list
    //         const gmail = gmailList.find(calendar => calendar.primary === true);
    //         setActiveGcalendar(calender);
    //     }
    //     return activeGcalendar;
    // }
    function handleItemLabel(gcalendar: Gcalendar) {
        return gcalendar.summary;
    }
    const handleGcalendarChange = (event: object, value: any) => {
        setActiveGcalendar(value);
    };
    const handleGmailEventChange = (event: object, value: any) => {
        setGmailEvent(value);
    };
    const getKeyFromCalConnection = (key: string) => {
        return activeConnection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key).codeVariableKey;
    };

    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createGmailTrigger();
        } else {
            updateGmailTrigger();
        }
    };

    // handle trigger configure complete
    const createGmailTrigger = () => {
        const clientId = getKeyFromCalConnection('clientIdKey');
        const clientSecret = getKeyFromCalConnection('clientSecretKey');
        const refreshUrl = getKeyFromCalConnection('tokenEpKey');
        const refreshToken = getKeyFromCalConnection('refreshTokenKey');

        setTriggerChanged(true);
        // dispatch and close the wizard
        dispatchModifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "gcalendar",
            PORT: 8090,
            CLIENT_ID: clientId,
            CLIENT_SECRET: clientSecret,
            REFRESH_URL: refreshUrl,
            REFRESH_TOKEN: refreshToken,
            CALENDAR_ID: activeGcalendar.id,
            EVENT: gmailEvent,
        });
        trackTriggerSelection("Google Calender");
    };

    // handle calendar trigger update
    const updateGmailTrigger = () => {
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
            dispatchMutations(modifications);
            setTriggerChanged(true);
        }
    };
    const chooseGmailPlaceholder = intl.formatMessage({
            id: "lowcode.develop.GmailConfigWizard.chooseGmail.placeholder",
            defaultMessage: "Choose calendar"
        });
    const chooseEventPlaceholder = intl.formatMessage({
            id: "lowcode.develop.GmailConfigWizard.chooseEvent.placeholder",
            defaultMessage: "Choose Event"
        });
    const saveConfigButton = intl.formatMessage({
            id: "lowcode.develop.GmailConfigWizard.saveConfigButton.text",
            defaultMessage: "Save"
        });
    return (
        <>
            <div className={classes.customWrapper}>
                {/* <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GmailConfigWizard.googleConnection.title" defaultMessage="Google Connection"/></p> */}
                {/* <OauthConnectButton
                    connectorName={Trigger}
                    currentConnection={activeConnection}
                    onSelectConnection={handleOnSelectConnection}
                    onDeselectConnection={handleOnDeselectConnection}
                    onFailure={handleError}
                />
                <p />
                {activeConnection && isCalenderFetching && (
                    <div className={classes.loader}>
                        <CirclePreloader position="relative" />
                        <Typography variant="subtitle2" className={classes.loaderTitle}>
                        <FormattedMessage id="lowcode.develop.GmailConfigWizard.fetchingGmailMessage.text" defaultMessage="Fetching calendars ..."/>
                        </Typography>
                    </div>

                )}
                {activeConnection && !isCalenderFetching && gmailList && (
                    <>
                        <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GmailConfigWizard.gmail.title.text" defaultMessage="Google Gmail"/></p>
                        <FormAutocomplete
                            placeholder={chooseGmailPlaceholder}
                            itemList={gmailList}
                            value={getActiveGcalendar()}
                            getItemLabel={handleItemLabel}
                            onChange={handleGcalendarChange}
                        />
                    </>
                )} */}
                {true && (
                    <>
                        <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.GmailConfigWizard.googleGmailEvent.title.text" defaultMessage="Event"/></p>
                        <FormAutocomplete
                            placeholder={chooseEventPlaceholder}
                            itemList={Object.keys(gmailEvents)}
                            value={gmailEvent}
                            onChange={handleGmailEventChange}
                        />
                    </>
                )}
            </div>

            { activeConnection && activeGcalendar &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text={saveConfigButton}
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                )}
        </>
    )
}
