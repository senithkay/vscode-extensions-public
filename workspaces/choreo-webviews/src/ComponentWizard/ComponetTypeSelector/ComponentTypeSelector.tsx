/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ChoreoServiceComponentType } from "@wso2-enterprise/choreo-core";
import React from "react";

const Container = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 10px;
`;

const typeBtn = css`
    min-width: 100px;
    padding: 10px 0px;
`;

interface SelectorProps {
    selectedType?: ChoreoServiceComponentType;
    onChange: (type: ChoreoServiceComponentType) => void;
}

export function ComponentTypeSelector(props: SelectorProps) {
    const {selectedType, onChange} = props;

    return (
        <>
            <label htmlFor="type-selector">Select Service Type</label>
            <Container>
                <VSCodeButton
                    appearance={selectedType === ChoreoServiceComponentType.REST_API ? "primary" : "secondary"}
                    onClick={() => {onChange(ChoreoServiceComponentType.REST_API)}}
                    className={cx(typeBtn)}
                >
                    REST
                </VSCodeButton>
                <VSCodeButton
                    appearance={selectedType === ChoreoServiceComponentType.GQL_API ? "primary" : "secondary"}
                    onClick={() => {onChange(ChoreoServiceComponentType.GQL_API)}}
                    className={cx(typeBtn)}
                >
                    GraphQL
                </VSCodeButton>
                <VSCodeButton
                    appearance={selectedType === ChoreoServiceComponentType.GRPC_API ? "primary" : "secondary"}
                    onClick={() => {onChange(ChoreoServiceComponentType.GRPC_API)}}
                    className={cx(typeBtn)}
                >
                    GRPC
                </VSCodeButton>
                <VSCodeButton
                    appearance={selectedType === ChoreoServiceComponentType.WEBSOCKET_API ? "primary" : "secondary"}
                    onClick={() => {onChange(ChoreoServiceComponentType.WEBSOCKET_API)}}
                    className={cx(typeBtn)}
                >
                    WebSocket
                </VSCodeButton>
            </Container>
        </>
    );
}
