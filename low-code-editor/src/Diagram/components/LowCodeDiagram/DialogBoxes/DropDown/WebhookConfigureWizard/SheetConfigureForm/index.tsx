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

import {STKindChecker} from "@ballerina/syntax-tree";

import { DiagramOverlayPosition } from "../../../../../Portals/Overlay";
import { ConnectionDetails } from "../../../../../../../api/models";
import {Context} from "../../../../../../../Contexts/Diagram";
import {
    EVENT_TYPE_AZURE_APP_INSIGHTS,
    LowcodeEvent,
    TRIGGER_SELECTED_INSIGHTS,
    TRIGGER_TYPE_WEBHOOK
} from "../../../../../../models";
import { FormAutocomplete } from "../../../../FormFieldComponents/Autocomplete";
import { PrimaryButton } from "../../../../FormFieldComponents/Button/PrimaryButton";
import { FormTextInput } from "../../../../FormFieldComponents/TextField/FormTextInput";
import {SourceUpdateConfirmDialog} from "../../../SourceUpdateConfirmDialog";
import { useStyles } from "../../styles";

interface SheetConfigureFormProps {
    position: DiagramOverlayPosition;
    onComplete: () => void;
    currentConnection?: ConnectionDetails;
}

export interface ConnectorEvents {
    [ key: string ]: any;
}

export function SheetConfigureForm(props: SheetConfigureFormProps) {
    const {
        api: {
            insights: {
                onEvent
            },
            code: {
                modifyTrigger
            }
        },
        props: {
            isMutationProgress: isFileSaving,
            isLoadingSuccess: isFileSaved,
            syntaxTree,
        }
    } = useContext(Context);

    const { onComplete } = props;
    const classes = useStyles();
    const intl = useIntl();

    const [ triggerChanged, setTriggerChanged ] = useState(false);
    const [ sheetId, setSheetId ] = useState<string>();
    const [ sheetEvent, setSheetEvent ] = useState<string>();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // HACK: hardcoded event list until get it form connector API
    const sheetEvents = [ 'onAppendRow', 'onUpdateRow' ];

    useEffect(() => {
        if (!isFileSaving && isFileSaved && triggerChanged) {
            onComplete();
            setTriggerChanged(false);
        }
    }, [ isFileSaving, isFileSaved ]);

    // handle oauth connect button callbacks
    const handleSheetIdChange = (value: string) => {
        setSheetId(value);
    };
    const handleSheetEventChange = (event: object, value: string) => {
        setSheetEvent(value);
    };
    const handleUserConfirm = () => {
        if (STKindChecker.isModulePart(syntaxTree)) {
            createSheetTrigger();
        } else {
            setShowConfirmDialog(true);
        }
    };
    const handleDialogOnCancel = () => {
        setShowConfirmDialog(false);
    };

    // handle trigger configure complete
    const createSheetTrigger = () => {
        setTriggerChanged(true);
        // dispatch and close the wizard
        modifyTrigger(TRIGGER_TYPE_WEBHOOK, undefined, {
            TRIGGER_NAME: "gsheet",
            PORT: 8090,
            SPREADSHEET_ID: sheetId,
            EVENT: sheetEvent,
        });
        const event: LowcodeEvent = {
            type: EVENT_TYPE_AZURE_APP_INSIGHTS,
            name: TRIGGER_SELECTED_INSIGHTS,
            property: "Google Sheet"
        };
        onEvent(event);
    };

    const sheetIdPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GSheetConfigWizard.sheetId.placeholder",
        defaultMessage: "Sheet ID"
    });

    const sheetConfigTooltips = {
        sheetTrigger: {
            sheetId: intl.formatMessage({
                id: "lowcode.develop.triggerDropDown.sheetTrigger.sheetId.tooltip.title",
                defaultMessage: "Google Sheet ID"
            }),
        }
    };

    const chooseEventPlaceholder = intl.formatMessage({
        id: "lowcode.develop.GSheetConfigWizard.chooseEvent.placeholder",
        defaultMessage: "Choose Event"
    });

    const saveConfigButton = intl.formatMessage({
        id: "lowcode.develop.GSheetConfigWizard.saveConfigButton.text",
        defaultMessage: "Save"
    });

    return (
        <>
            <div className={classes.customWrapper}>
                <FormTextInput
                    label={sheetIdPlaceholder}
                    defaultValue={sheetId}
                    onChange={handleSheetIdChange}
                    customProps={ {
                        optional: false,
                        tooltipTitle: sheetConfigTooltips.sheetTrigger.sheetId
                    } }
                />
                <p className={classes.textFieldLabel}><FormattedMessage id="lowcode.develop.GSheetConfigWizard.googleSheetEvent.title.text" defaultMessage="Event" /></p>
                <FormAutocomplete
                    placeholder={chooseEventPlaceholder}
                    itemList={sheetEvents}
                    value={sheetEvent}
                    onChange={handleSheetEventChange}
                />
            </div>

            { sheetId && sheetEvent &&
                (
                    <div className={classes.customFooterWrapper}>
                        <PrimaryButton
                            text={saveConfigButton}
                            onClick={handleUserConfirm}
                            disabled={isFileSaving}
                        />
                    </div>
                ) }

            {showConfirmDialog && (
                <SourceUpdateConfirmDialog
                    onConfirm={createSheetTrigger}
                    onCancel={handleDialogOnCancel}
                />
            )}
        </>
    );
}
