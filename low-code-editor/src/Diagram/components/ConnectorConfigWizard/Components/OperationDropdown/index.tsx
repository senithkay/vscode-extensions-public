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
import { SelectDropdownWithButton } from "../../../Portals/ConfigForm/Elements/DropDown/SelectDropdownWithButton";
import { TooltipIcon } from '../../../Portals/ConfigForm/Elements/Tooltip';
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


    const handleSelect = (selectedOperation: string) => {
        onOperationSelect(selectedOperation);
    };

    return (
        <div>
            <div className={classNames(classes.configWizardAPIContainerAuto, classes.bottomRadius)}>
                <div className={classes.fullWidth}>
                    {showConnectionName ? (
                        <>
                        <div className={classes.connectionNameWrapper}>

                        <p className={classes.subTitle}>Connection</p>
                        <div><TooltipIcon
                            title="Name of the connection"
                            placement={"left"}
                            arrow={true}
                        /></div>
                        </div>
                        <Box border={1} borderRadius={5} className={classes.box}>
                            <Typography variant="subtitle2">
                                {connectionDetails.name}
                            </Typography>
                            <IconButton
                                color="primary"
                                classes={ {
                                    root: classes.changeConnectionBtn
                                } }
                                onClick={onConnectionChange}
                            >
                                <EditIcon />

                            </IconButton>

                        </Box>
                        </>
                    ) : null
                    }
                    <SelectDropdownWithButton
                        customProps={{ disableCreateNew: true, values: operations, tooltipTitle: "Select an operation to continue" }}
                        label="Select Operation"
                        placeholder="Select"
                        defaultValue=""
                        onChange={handleSelect}
                    />
                </div>
            </div>
        </div>
    );
}
