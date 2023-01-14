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

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import { Card, CardContent } from "@mui/material";
import { Service, Colors } from "../../../resources";
import { ControlsContainer, Header, Container, TitleText } from "../../../editing/EditForm/resources/styles";
import {
    BallerinaConnectorInfo,
    BallerinaConnectorsRequest,
    BallerinaConnectorsResponse,
    BallerinaConstruct,
    BallerinaModuleResponse,
    Connector,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { CreateButton } from "../../../editing/EditForm/components";
import { BallerinaModuleType, Marketplace, SearchQueryParams } from "../Marketplace";
import { ProjectDesignRPC } from "../../../utils/rpc/project-design-rpc";

interface ConnectorWizardProps {
    service: Service;
    onClose: () => void;
}

export function ConnectorWizard(props: ConnectorWizardProps) {
    const { service, onClose } = props;

    const [showLoader, setShowLoader] = useState(false);
    const [showDrawer, setShowDrawer] = useState(true);
    const [selectedCon, setSelectedCon] = useState<Connector>();

    const rpcInstance = ProjectDesignRPC.getInstance();

    const onSubmit = () => {
        if(!selectedCon){
            return; // No active connector
        }
        setShowLoader(true);       
        rpcInstance.addConnector(selectedCon, service)
            .then((res) => {
                // TODO: Handle error flow
            })
            .finally(() => {
                setShowLoader(false);
                closeForm();
            });
    };

    const onConnectorSelect = (balModule: BallerinaConstruct) => {
        setSelectedCon(balModule);
    };

    const fetchConnectorsList = async (queryParams: SearchQueryParams): Promise<BallerinaModuleResponse> => {
        const connectorRes = await rpcInstance.getConnectors(queryParams);
        return Promise.resolve(connectorRes as BallerinaModuleResponse);
    };

    const closeForm = () => {
        setShowDrawer(false);
        onClose();
    };

    return ReactDOM.createPortal(
        <Drawer
            anchor="right"
            open={showDrawer}
            onClose={() => {
                closeForm();
            }}
        >
            <Container isLoading={showLoader}>
                <Header>
                    <TitleText>Add Connector</TitleText>
                    <IconButton
                        size="small"
                        onClick={() => {
                            closeForm();
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Header>

               <Marketplace
                    balModuleType={BallerinaModuleType.Connector}
                    onSelect={onConnectorSelect}
                    onCancel={closeForm}
                    fetchModulesList={fetchConnectorsList}
                    title={"External connectors"}
                    shortName="connectors"
                />

                 <ControlsContainer>
                    {selectedCon && (
                        <CreateButton
                            label={`Add ${selectedCon.displayAnnotation?.label || selectedCon.moduleName} Connector`}
                            onClick={onSubmit}
                            color={Colors.PRIMARY}
                            disabled={!selectedCon}
                        />
                    )}
                </ControlsContainer> 
            </Container>

            {showLoader && <CircularProgress sx={{ top: "45%", left: "45%", position: "absolute", color: Colors.PRIMARY }} />}
        </Drawer>,
        document.body
    );
}
