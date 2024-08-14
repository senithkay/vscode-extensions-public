/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DIRECTORY_MAP } from '@wso2-enterprise/ballerina-core';
import { Button, Codicon, ComponentCard, Icon, TextField, Typography } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';
import { useRpcContext } from '@wso2-enterprise/ballerina-rpc-client';
import { ServiceType } from "./ServiceType";
import { HttpForm } from "./HttpForm";
import { SERVICE_VIEW } from "./constants";

const FORM_WIDTH = 600;

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: auto; /* Center vertically and horizontally */
    max-width: 600px;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

const BottomMarginTextWrapper = styled.div`
    font-size: 13px;
    margin-bottom: 10px;
`;

const HorizontalCardContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const IconWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const ButtonWrapper = styled.div`
    margin-top: 20px;
    width: 130px;
`;

export function ServiceForm() {
    const { rpcClient } = useRpcContext();
    const [component, setComponent] = useState(null);
    const [view, setView] = useState(SERVICE_VIEW.TYPE);

    useEffect(() => {
        switch (view) {
            case SERVICE_VIEW.HTTP_FORM:
                setComponent(<HttpForm handleView={handleSetView} />);
                break;
            case SERVICE_VIEW.TYPE:
                setComponent(<ServiceType handleView={handleSetView} />);
                break;
        }
    }, [view]);

    const handleSetView = (view: SERVICE_VIEW) => {
        setView(view)
    }

    return (
        <>
            {component}
        </>
    );
};
