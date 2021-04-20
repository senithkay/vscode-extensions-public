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
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { TooltipIcon } from '../../../../../components/Tooltip';
import { ConnectorConfig } from "../../../../../ConfigurationSpec/types";
import { FormAutocomplete } from '../../../Portals/ConfigForm/Elements/Autocomplete';
import { wizardStyles } from "../../style";

export interface OperationDropdownProps {
    operations: string[];
    showConnectionName: boolean;
    connectionDetails: ConnectorConfig;
    onOperationSelect: (operation: string) => void;
    onConnectionChange: () => void;
}

export function OperationDropdown(props: OperationDropdownProps) {
    const { operations, showConnectionName, onOperationSelect, connectionDetails, onConnectionChange } = props;
    const classes = wizardStyles();
    const intl = useIntl();

    const handleSelect = (event: object, value: any, reason: string) => {
        onOperationSelect(value);
    };

    const operationDropdownPlaceholder = intl.formatMessage({
        id: "lowcode.develop.connectorForms.operationDropdown.placeholder",
        defaultMessage: "Search Operation"
    });

    return (
        <div>
            <div className={classNames(classes.configWizardAPIContainerAuto, classes.bottomRadius)}>
                <div className={classes.fullWidth}>
                    {showConnectionName && (
                        <>
                            <div className={classes.connectionNameWrapper}>
                                <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.operationDropdown.connectionName.title" defaultMessage="Connection"/></p>
                                <div>
                                    <TooltipIcon
                                        title="Name of the connection"
                                        placement={"left"}
                                        arrow={true}
                                    />
                                </div>
                            </div>
                            <Box border={1} borderRadius={5} className={classes.box}>
                                <Typography variant="subtitle2">
                                    {connectionDetails.name}
                                </Typography>
                                <IconButton
                                    color="primary"
                                    classes={{
                                        root: classes.changeConnectionBtn
                                    }}
                                    onClick={onConnectionChange}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Box>
                        </>
                    )}
                    <p className={classes.subTitle}><FormattedMessage id="lowcode.develop.connectorForms.operationDropdown.title" defaultMessage="Operation"/></p>
                    <FormAutocomplete
                        placeholder={operationDropdownPlaceholder}
                        itemList={operations}
                        onChange={handleSelect}
                    />
                </div>
            </div>
        </div>
    );
}
