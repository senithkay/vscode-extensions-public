/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { ComponentPropsWithRef } from "react";
import styled from "@emotion/styled";
import { TextField } from "@wso2-enterprise/ui-toolkit";

export interface IKeylookup extends ComponentPropsWithRef<"input"> {
    label?: string;
    size?: number;

    // Artifact type to be fetched
    filterType?: string;
    // Callback to filter the fetched artifacts
    filter?: (value: string) => void;
}

export const Keylookup = (props: IKeylookup) => {
    const { label, filterType, filter, ...rest } = props;

    return <TextField {...rest} />;
};

