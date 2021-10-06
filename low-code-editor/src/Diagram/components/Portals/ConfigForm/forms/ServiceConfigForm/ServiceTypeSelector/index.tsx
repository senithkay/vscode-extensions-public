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

import React from "react";

import { List, ListItem, Typography } from "@material-ui/core";

import { ServiceTypes } from "..";

interface ServiceTypeSelectorProps {
    onSelect: (type: string) => void;
}

export function ServiceTypeSelector(props: ServiceTypeSelectorProps) {
    const { onSelect } = props;

    const types = Object.values(ServiceTypes).map(type => {
        const handleOnSelect = () => {
            onSelect(type);
        }

        return (
            <ListItem
                key={`service-type-${type.toLowerCase()}`}
                button={true}
                onClick={handleOnSelect}
            >
                <Typography
                    variant="h4"
                >
                    {type}
                </Typography>
            </ListItem>

        )
    })

    return (
        <>
            <Typography
            >
                Select Service Type
            </Typography>
            <List >
                {types}
            </List>
        </>
    )

}
