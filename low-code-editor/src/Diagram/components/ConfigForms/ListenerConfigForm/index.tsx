/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, FormHelperText, Typography } from "@material-ui/core";

import { ListenerIcon } from "../../../../assets/icons";
import { PrimaryButton } from "../../../../components/Buttons/PrimaryButton";
import { STModification } from "../../../../Definitions";
import { createImportStatement, createListenerDeclartion } from "../../../utils/modification-util";
import { DraftUpdatePosition } from "../../../view-state/draft";
import { SecondaryButton } from "../../Portals/ConfigForm/Elements/Button/SecondaryButton";
import { SelectDropdownWithButton } from "../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../../Portals/ConfigForm/Elements/TextField/FormTextInput";

import { useStyles } from "./style";
import { ListenerConfig } from "./util/types";

interface ListenerConfigFormProps {
    model?: STNode;
    targetPosition?: DraftUpdatePosition;
    onCancel: () => void;
    onSave: (modifications: STModification[]) => void;
}

const defaultState: ListenerConfig = {
    listenerName: '',
    listenerPort: '',
    listenerType: 'http'
}

// FixMe: show validation messages to listenerName and listenerPort
export function ListenerConfigForm(props: ListenerConfigFormProps) {
    const formClasses = useStyles();
    const { targetPosition, onCancel, onSave } = props;
    const [config, setCofig] = useState(defaultState);
    const saveBtnDisabled: boolean = false;

    const onListenerNameChange = (listenerName: string) => {
        setCofig({
            listenerName,
            listenerPort: config.listenerPort,
            listenerType: 'http'
        });
    }

    const onListenerPortChange = (listenerPort: string) => {
        config.listenerPort = listenerPort;
        setCofig({
            listenerName: config.listenerName,
            listenerPort,
            listenerType: 'http'
        });
    }


    const handleOnSave = () => {
        onSave([
            createImportStatement('ballerina', 'http', { column: 0, line: 0 }),
            createListenerDeclartion(config, targetPosition)
        ]);
    }

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}>
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <ListenerIcon color={'#CBCEDB'} />
                    <Typography variant="h4">
                        <Box paddingTop={2} paddingBottom={2} paddingLeft={15}>Listener</Box>
                    </Typography>
                </div>
            </div>

            <div className={formClasses.formWrapper}>
                <>
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerType"
                                defaultMessage="Listener Type :"
                            />
                        </FormHelperText>
                    </div>
                    <SelectDropdownWithButton
                        customProps={{
                            values: ['HTTP'],
                            disableCreateNew: true,
                        }}
                        defaultValue={'HTTP'}
                        placeholder="Select Type"
                    />
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerName"
                                defaultMessage="Listener Name :"
                            />
                        </FormHelperText>
                    </div>
                    <FormTextInput
                        dataTestId="listener-name"
                        onChange={onListenerNameChange}
                    />
                    <div className={formClasses.labelWrapper}>
                        <FormHelperText className={formClasses.inputLabelForRequired}>
                            <FormattedMessage
                                id="lowcode.develop.connectorForms.HTTP.listenerPortNumber"
                                defaultMessage="Listener Port :"
                            />
                        </FormHelperText>
                    </div>
                    <FormTextInput
                        dataTestId="listener-port"
                        onChange={onListenerPortChange}
                    />
                </>
            </div>
            <div className={formClasses.wizardBtnHolder}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    text="Save"
                    disabled={saveBtnDisabled}
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </FormControl>
    )
}
