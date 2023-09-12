/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function DefaultConnectorIcon(props: { styles?: CSSProperties }) {
    return (
        <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <path d="M402 707l494 305-342 285-490-319zm986 555v108l-490 293v1l-1-1-1 1v-1l-489-293v-108l147 96 342-284v-2l1 1 1-1v2l343 284zm-834-1144l342 285-494 304-338-270zm836 589l338 271-489 319-343-285zm-151-589l489 319-338 270-494-304z" />
        </svg>
    );
}
