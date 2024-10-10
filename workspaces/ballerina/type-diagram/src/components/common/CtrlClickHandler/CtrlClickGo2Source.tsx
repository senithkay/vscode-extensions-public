/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { PropsWithChildren, useContext } from 'react';
import { CMLocation as Location, NodePosition } from '@wso2-enterprise/ballerina-core';
import { CtrlClickWrapper } from '@wso2-enterprise/ballerina-core';
import { DiagramContext } from '../DiagramContext/DiagramContext';

interface CtrlClickProps {
    location: Location;
}

export function CtrlClickGo2Source(props: PropsWithChildren<CtrlClickProps>) {
    const { location, children } = props;
    const { goToSource } = useContext(DiagramContext);
    const handleOnClick = () => {
        if (location.filePath && location.endPosition, location.startPosition) {
            const nodePosition: NodePosition = {
                startLine: location.startPosition.line,
                startColumn: location.startPosition.offset,
                endLine: location.endPosition.line,
                endColumn: location.endPosition.offset
            }
            goToSource(location?.filePath, nodePosition);
        }
    };

    return (
        <CtrlClickWrapper onClick={handleOnClick}>
            {children}
        </CtrlClickWrapper>
    )
}
