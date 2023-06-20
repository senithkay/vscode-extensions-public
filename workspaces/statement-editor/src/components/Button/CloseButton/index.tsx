/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

import { CloseRounded } from "@material-ui/icons";
import { ButtonWithIcon } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";

interface CloseButtonProps {
    onCancel: () => void;
}

export function CloseButton(props: CloseButtonProps) {
    const { onCancel } = props;
    return (
        <ButtonWithIcon
            className="panel-close-button"
            onClick={onCancel}
            icon={<CloseRounded fontSize="small" />}
        />
    );
}
