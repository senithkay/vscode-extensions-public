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

import { Box, IconButton, Typography } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import classNames from 'classnames';

import { ConnectorConfig } from "../../../../../ConfigurationSpec/types";
import { FormAutocomplete } from '../../../Portals/ConfigForm/Elements/Autocomplete';
import { TooltipIcon } from '../../../Portals/ConfigForm/Elements/Tooltip';
import { wizardStyles } from "../../style";

export interface OperationDropdownProps {
    operations: string[];
    showConnectionName: boolean;
    connectionDetails: ConnectorConfig;
    onOperationSelect: (operation: string) => void;
}

export function OperationDropdown(props: OperationDropdownProps) {
    const { operations, showConnectionName, onOperationSelect, connectionDetails } = props;
    const classes = wizardStyles();

    const handleSelect = (event: object, value: any, reason: string) => {
        onOperationSelect(value);
    };

    return (
        <div>
            <div className={classNames(classes.configWizardAPIContainerAuto, classes.bottomRadius)}>
                <div className={classes.fullWidth}>
                    <p className={classes.subTitle}>Operation</p>
                    <FormAutocomplete
                        placeholder="Search Operation"
                        itemList={operations}
                        onChange={handleSelect}
                    />
                </div>
            </div>
        </div>
    );
}
