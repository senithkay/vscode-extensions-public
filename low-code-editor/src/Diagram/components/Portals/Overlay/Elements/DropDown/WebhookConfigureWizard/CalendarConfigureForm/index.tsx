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
import { SourceUpdateConfirmDialog } from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";

interface CalendarConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [key: string]: any;
}

export function CalendarConfigureForm(props: CalendarConfigureFormProps) {
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
    const isEmptySource = (body?.statements.length < 1) || (body?.statements === undefined);
    const { position, onComplete, currentConnection } = props;
    const classes = useStyles();

    const [activeConnection, setActiveConnection] = useState<ConnectionDetails>(currentConnection);
    const [activeGcalendar, setActiveGcalendar] = useState<Gcalendar>(null);
    const [triggerChanged, setTriggerChanged] = useState(false);
    const [gcalenderList, setGcalenderList] = useState<Gcalendar[]>(undefined)
    const [isCalenderFetching, setIsCalenderFetching] = useState(false);
    const Trigger = "Google Calendar";

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
    const getKeyFromCalConnection = (key: string) => {
        return activeConnection?.codeVariableKeys.find((keys: { name: string; }) => keys.name === key).codeVariableKey;
    };

    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createCalendarTrigger();
        } else {
            updateCalendarTrigger();
        }
    };

    // handle trigger configure complete
    const createCalendarTrigger = () => {
        const accessToken = getKeyFromCalConnection('accessTokenKey');
        const clientId = getKeyFromCalConnection('clientIdKey');
        const clientSecret = getKeyFromCalConnection('clientSecretKey');
        const refreshUrl = getKeyFromCalConnection('tokenEpKey');
        const refreshToken = getKeyFromCalConnection('refreshTokenKey');

        setTriggerChanged(true);
        // dispatch and close the wizard
        dispatchModifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "gcalendar",
            PORT: 8090,
            ACCESS_TOKEN: accessToken,
            CLIENT_ID: clientId,
            CLIENT_SECRET: clientSecret,
            REFRESH_URL: refreshUrl,
            REFRESH_TOKEN: refreshToken,
            CALENDAR_ID: activeGcalendar.id,
            UUID: Math.floor(Math.random() * 10000000) // FIXME: Use UUID instead
        });
        trackTriggerSelection("Google Calender");
    };

    // handle calendar trigger creation
    const updateCalendarTrigger = () => {
        // get nodes to be edited
        const calenderConfig = (originalSyntaxTree as ModulePart).members.find(member =>
            ((member as ModuleVarDecl)?.typedBindingPattern?.typeDescriptor as QualifiedNameReference)?.
                identifier?.value === "CalendarConfiguration") as ModuleVarDecl;
        const oauthConfigField = (calenderConfig.initializer as MappingConstructor).fields.find(field =>
            (field as SpecificField).fieldName.value === "oauth2Config") as SpecificField;
        const oauthConfigValExprNode = oauthConfigField.valueExpr;

        const functionDefs = (originalSyntaxTree as ModulePart).members.filter(member =>
            STKindChecker.isFunctionDefinition(member)) as FunctionDefinition[];
        const intFunction = functionDefs.find(functionDef =>
            functionDef.functionName.value === "init") as FunctionDefinition;
        const localVarDecls = (intFunction.functionBody as FunctionBodyBlock).statements.filter(statement =>
            STKindChecker.isLocalVarDecl(statement)) as LocalVarDecl[];
        let calIdNode: STNode;
        localVarDecls.forEach(varDecl => {
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

            const calConfigTemplate = `{\n
                                            clientId: ${clientId},\n
                                            clientSecret: ${clientSecret},\n
                                            refreshUrl: ${refreshUrl},\n
                                            refreshToken: ${refreshToken}\n
                                            \n
                                       }\n`;
            modifications.push(updatePropertyStatement(calConfigTemplate, oauthConfigValExprNode.position));
            modifications.push(updatePropertyStatement(`"${activeGcalendar.id}"`, calIdNode.position));
            dispatchMutations(modifications);
            setTriggerChanged(true);
        }
    };

    return (
        <>
            <div className={classes.customWrapper}>
                <p className={classes.subTitle}>Google Connection</p>
                <OauthConnectButton
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
                            Fetching Calendars&nbsp;...
                        </Typography>
                    </div>

                )}
                {activeConnection && !isCalenderFetching && gcalenderList && (
                    <>
                        <p className={classes.subTitle}>Google Calendar</p>
                        <FormAutocomplete
                            placeholder="Choose Calendar"
                            itemList={gcalenderList}
                            value={getActiveGcalendar()}
                            getItemLabel={handleItemLabel}
                            onChange={handleGcalendarChange}
                        />
                    </>
                )}
            </div>

            { activeConnection && activeGcalendar &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text="Save"
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                )}
        </>
    )
}
