/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useContext, useState } from "react";
import ReactDOM from "react-dom";
import { Service } from "@wso2-enterprise/ballerina-languageclient";
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
    service: Service;
    onClose: () => void;
}

export function ConnectorWizard(props: ConnectorWizardProps) {
    const { service, onClose } = props;
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

                {selectedCon && <ConnectorForm connector={selectedCon} onSave={handleConnectorSave} service={service}/>}
            </Container>
        </Drawer>,
        document.body
    );
}
