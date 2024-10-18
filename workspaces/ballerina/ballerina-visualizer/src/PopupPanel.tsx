/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { MACHINE_VIEW, PopupMachineStateValue, PopupVisualizerLocation } from "@wso2-enterprise/ballerina-core";
import { useRpcContext } from "@wso2-enterprise/ballerina-rpc-client";
import AddConnectionWizard from "./views/BI/Connection/AddConnectionWizard";
import { Colors } from "./resources/constants";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";
import EditConnectionWizard from "./views/BI/Connection/EditConnectionWizard";

const ViewContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3000;
    background-color: ${Colors.SURFACE_BRIGHT};
    padding: 20px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 16px;
`;

interface PopupPanelProps {
    formState: PopupMachineStateValue;
    onClose: () => void;
}

const PopupPanel = (props: PopupPanelProps) => {
    const { formState, onClose } = props;
    const { rpcClient } = useRpcContext();
    const [viewComponent, setViewComponent] = useState<React.ReactNode>();

    useEffect(() => {
        if (typeof formState === "object" && "open" in formState) {
            fetchContext();
        }
    }, [formState]);

    useEffect(() => {
        fetchContext();
    }, []);

    const fetchContext = () => {
        rpcClient.getPopupVisualizerState().then((machineSate: PopupVisualizerLocation) => {
            switch (machineSate?.view) {
                case MACHINE_VIEW.AddConnectionWizard:
                    setViewComponent(<AddConnectionWizard onClose={onClose} />);
                    break;
                case MACHINE_VIEW.EditConnectionWizard:
                    setViewComponent(
                        <EditConnectionWizard connectionName={machineSate?.identifier} onClose={onClose} />
                    );
                    break;
                default:
                    setViewComponent(null);
            }
        });
    };

    return (
        <ViewContainer>
            <TopBar>
                <div></div>
                <Button appearance="icon" onClick={onClose}>
                    <Codicon name="close" />
                </Button>
            </TopBar>
            {viewComponent}
        </ViewContainer>
    );
};

export default PopupPanel;
