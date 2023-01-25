/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { dynamicConnectorStyles as useFormStyles } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

import {ServiceTypes} from "./SeviceForm";

interface ServiceTypeSelectorProps {
    onSelect: (type: string) => void;
}

export function ServiceTypeSelector(props: ServiceTypeSelectorProps) {
    const { onSelect } = props;
    const formClasses = useFormStyles();

    const types = Object.keys(ServiceTypes).map((type, i) => {
        const values = Object.values(ServiceTypes);
        const handleOnSelect = () => {
            onSelect(values[i]);
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
        <div className={formClasses.formContentWrapper}>
            <Typography >
                Select Service Type
            </Typography>
            <List data-testid="service-types-list">
                {types}
            </List>
        </div>
    )
}
