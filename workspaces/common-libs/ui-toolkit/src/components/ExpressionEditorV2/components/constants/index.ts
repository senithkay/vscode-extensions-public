/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { css } from '@emotion/react';

export const ANIMATION = {
    enter: css({
        transition: 'all 0.3s ease-in'
    }),
    enterFrom: css({
        opacity: 0
    }),
    enterTo: css({
        opacity: 1
    }),
    leave: css({
        transition: 'all 0.15s ease-out'
    }),
    leaveFrom: css({
        opacity: 1
    }),
    leaveTo: css({
        opacity: 0
    })
};
