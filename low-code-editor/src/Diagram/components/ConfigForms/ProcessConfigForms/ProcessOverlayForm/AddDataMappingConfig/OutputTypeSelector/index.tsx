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
import React from 'react';
import { TypeInfoEntry } from "../../../../../Portals/ConfigForm/types";
import { Autocomplete } from "@material-ui/lab";
import { TextField } from "@material-ui/core";

interface OutputTypeSelectorProps {
    types: TypeInfoEntry[];
    updateReturnType: (returnType: TypeInfoEntry) => void,
}

export function OutputTypeSelector(props: OutputTypeSelectorProps) {
    const { types, updateReturnType } = props;

    const handleUpdateReturnType = (evt: any, option: TypeInfoEntry) => {
        updateReturnType(option);
    }

    return (
        <>
            <Autocomplete
                id="country-select-demo"
                options={types}
                autoHighlight={true}
                getOptionLabel={(option) => option.typeName}
                renderOption={(option) => (
                    <React.Fragment>
                        <span>{option.typeName}</span>
                        {option.typeInfo?.moduleName}
                    </React.Fragment>
                )}
                onChange={handleUpdateReturnType}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Type"
                        variant="outlined"
                        inputProps={{
                            ...params.inputProps,
                            autoComplete: 'new-password', // disable autocomplete and autofill
                        }}
                    />
                )}
            />
        </>
    );
}
