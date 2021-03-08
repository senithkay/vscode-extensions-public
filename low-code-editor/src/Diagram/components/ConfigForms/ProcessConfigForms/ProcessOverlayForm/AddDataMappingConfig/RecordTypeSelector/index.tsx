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
// tslint:disable:jsx-no-lambda
// tslint:disable: jsx-no-multiline-js

import React from 'react';

import { TextField } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

interface RecordTypeSelectorProps {

}

const supportedTypes = ['string', 'int', 'double', 'xml', 'json', 'Person', 'Employee']

export function RecordTypeSelector(props: RecordTypeSelectorProps) {

    return (
        <Autocomplete
            id="country-select-demo"
            style={{ width: 300 }}
            options={supportedTypes}
            autoHighlight={true}
            getOptionLabel={(option) => option}
            renderOption={(option) => (
                <React.Fragment>
                    <span>{option}</span>
                </React.Fragment>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Choose a country"
                    variant="outlined"
                    inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                    }}
                />
            )}
        />
    )
}
