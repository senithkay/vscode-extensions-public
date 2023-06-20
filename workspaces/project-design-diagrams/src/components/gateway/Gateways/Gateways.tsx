/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from 'react';
import { GatewayIcon } from "../../../resources";
import { GatewayContainer } from "../../common/DiagramContainer/style";
import { DiagramContext } from "../../common";

export function Gateways() {
    const { consoleView } = useContext(DiagramContext);

    const westGWLeft = '-30px';
    const westGWTop = consoleView ? `calc(48% - 40px)` : `calc(50% - 40px)`;
    const northGWLeft = `calc(50% - 40px)`;
    const northGWTop = '0px';

    return (
        <>
            {/*West Gateway*/}
            <GatewayContainer top={westGWTop} left={westGWLeft}>
                <GatewayIcon/>
            </GatewayContainer>
            {/*North Gateway*/}
            <GatewayContainer top={northGWTop} left={northGWLeft} rotate={"90deg"}>
                <GatewayIcon/>
            </GatewayContainer>
        </>
    );
}
