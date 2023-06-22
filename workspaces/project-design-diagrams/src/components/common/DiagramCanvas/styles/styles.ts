/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from '@emotion/styled';

interface ControlPanelProps {
    showDownloadButton?: boolean;
}

export const ControlPanel: React.FC<any> = styled.div`
    bottom: ${(props: ControlPanelProps) => `${props.showDownloadButton ? 15 : 50}px`};
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: space-between;
    position: absolute;
    right: 15px;
    width: 32px;
`;
