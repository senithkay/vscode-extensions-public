/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";

import { Box, FormControl, InputLabel, MenuItem } from "@material-ui/core";
import Select from '@material-ui/core/Select';

export enum OperationTypes {
    Queries,
    Mutations,
    Subscriptions,
    All_Operations
}

interface TypeFilterProps {
    updateFilter: (type: OperationTypes) => void;
    isFilterDisabled: boolean;
}


export function TypeFilter(props: TypeFilterProps) {
    const { updateFilter, isFilterDisabled } = props;
    const [type, setType] = React.useState<OperationTypes>(OperationTypes.All_Operations);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setType(event.target.value as OperationTypes);
        updateFilter(event.target.value as OperationTypes);
    };

    return (
        <Box>
            <FormControl style={{margin: "10px", width: "130px"}} variant="outlined">
                <InputLabel id="demo-simple-select-label" >Operation Type</InputLabel>
                <Select
                    data-testid="operation-filter"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={type}
                    label="Operation Type"
                    onChange={handleChange}
                    disabled={isFilterDisabled}
                    SelectDisplayProps={{ style: { padding: '10px' } }}
                >
                    <MenuItem value={OperationTypes.All_Operations} className="operation-type">All Operations</MenuItem>
                    <MenuItem value={OperationTypes.Queries} className="operation-type">Queries</MenuItem>
                    <MenuItem value={OperationTypes.Mutations} className="operation-type">Mutations</MenuItem>
                    <MenuItem value={OperationTypes.Subscriptions}  className="operation-type">Subscriptions</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );

}
