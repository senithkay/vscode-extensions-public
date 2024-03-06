/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { StatusMessage } from "./StyledComp";
import { ProgressRing } from "@wso2-enterprise/ui-toolkit";

export function Loading() {
    return (
        <StatusMessage>
            <ProgressRing sx={{height:20, width:20}} />
            <div>Transforming into FHIR resource, Please wait ...</div>
        </StatusMessage>
    );
}
