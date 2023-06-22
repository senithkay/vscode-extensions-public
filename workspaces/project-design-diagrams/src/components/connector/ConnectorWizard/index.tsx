/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import { CMEntryPoint as EntryPoint, CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { Header, Container, TitleText } from "../../../editing/EditForm/resources/styles";
import {
    BallerinaConstruct,
    BallerinaModuleResponse,
    Connector,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BallerinaModuleType, Marketplace, SearchQueryParams } from "../Marketplace";
import { DiagramContext } from "../../common";
import ConnectorForm from "../ConnectorForm";

interface ConnectorWizardProps {
    source: EntryPoint | Service;
    onClose: () => void;
}

export function ConnectorWizard(props: ConnectorWizardProps) {
    const { source, onClose } = props;
    const { editLayerAPI } = useContext(DiagramContext);

    // const [showLoader, setShowLoader] = useState(false);
    const [showDrawer, setShowDrawer] = useState(true);
    const [selectedCon, setSelectedCon] = useState<Connector>();

    const fetchConnectorsList = async (queryParams: SearchQueryParams): Promise<BallerinaModuleResponse> => {
        const connectorRes = await editLayerAPI?.getConnectors(queryParams);
        return Promise.resolve(connectorRes as BallerinaModuleResponse);
    };

    const handleConnectorSelect = (balModule: BallerinaConstruct) => {
        setSelectedCon(balModule);
    };

    const handleFormBack = () => {
        setSelectedCon(undefined);
    };

    const handleConnectorSave = () => {
        handleCloseForm();
    };

    const handleCloseForm = () => {
        setShowDrawer(false);
        setSelectedCon(undefined);
        onClose();
    };

    return ReactDOM.createPortal(
        <Drawer
            anchor="right"
            open={showDrawer}
            onClose={() => {
                handleCloseForm();
            }}
        >
            <Container>
                <Header>
                    <div>
                        {selectedCon && (
                            <IconButton
                                size="small"
                                onClick={() => {
                                    handleFormBack();
                                }}
                            >
                                <ArrowBackIcon />
                            </IconButton>
                        )}
                        <TitleText>Add Connector</TitleText>
                    </div>
                    <IconButton
                        size="small"
                        onClick={() => {
                            handleCloseForm();
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Header>

                {!selectedCon && (
                    <Marketplace
                        balModuleType={BallerinaModuleType.Connector}
                        onSelect={handleConnectorSelect}
                        onCancel={handleCloseForm}
                        fetchModulesList={fetchConnectorsList}
                        title={"External connectors"}
                        shortName="connectors"
                    />
                )}

                {selectedCon && <ConnectorForm connector={selectedCon} onSave={handleConnectorSave} source={source} />}
            </Container>
        </Drawer>,
        document.body
    );
}
