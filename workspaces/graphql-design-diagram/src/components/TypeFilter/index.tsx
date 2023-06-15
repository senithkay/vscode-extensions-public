/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
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
}


export function TypeFilter(props: TypeFilterProps) {
    const { updateFilter } = props;
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
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={type}
                    label="Operation Type"
                    onChange={handleChange}
                    SelectDisplayProps={{ style: { padding: '10px' } }}
                >
                    <MenuItem value={OperationTypes.All_Operations}>All Operations</MenuItem>
                    <MenuItem value={OperationTypes.Queries}>Queries</MenuItem>
                    <MenuItem value={OperationTypes.Mutations}>Mutations</MenuItem>
                    <MenuItem value={OperationTypes.Subscriptions}>Subscriptions</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );

}
