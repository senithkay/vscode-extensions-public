/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from "react";
import { CMEntryPoint as EntryPoint, CMService as Service } from "@wso2-enterprise/ballerina-languageclient";
import { Connector } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import PullingModuleLoader from "./PullingModuleLoader";
import { Colors } from "../../../resources";
import ModuleIcon from "../Marketplace/ModuleIcon";
import { CreateButton } from "../../../editing/EditForm/components";
import {
    ActionContainer,
    ConnectorDetails,
    ConnectorName,
    Container,
    DetailContainer,
    ErrorTitle,
    IconCard,
    IconCardContent,
    LoaderSubtitle,
    LoaderTitle,
    LoadingWrapper,
    OrgName,
} from "./styles";
import { CircularProgress } from "@mui/material";
import { DiagramContext } from "../../common";

interface ConnectorFormProps {
    connector: Connector;
    source: EntryPoint | Service;
    onSave: () => void;
}

function ConnectorForm(props: ConnectorFormProps) {
    const { connector, source, onSave } = props;
    const { editLayerAPI } = useContext(DiagramContext);

    const [pulling, setPulling] = useState(true);
    const [error, setError] = useState<string>();
    const [showLoader, setShowLoader] = useState(false);

    const { refreshDiagram } = useContext(DiagramContext);

    const moduleName = (connector.displayAnnotation?.label || `${connector.package?.name} / ${connector.name}`).replace(/["']/g, "");

    useEffect(() => {
        editLayerAPI?.pullConnector(connector, source)
            .then((pulled) => {
                console.log('pullConnector', pulled)
                if (!pulled) {
                    setError("Something went wrong pulling the connector. Please try again.");
                }
            })
            .finally(() => {
                setPulling(false);
            });
    }, [connector]);

    const handleConnectorSave = () => {
        setShowLoader(true);
        editLayerAPI?.addConnector(connector, source)
            .then((res) => {
                console.log('addConnector', res)
                if (!res) {
                    setError("Something went wrong adding the connector. Please try again.");
                }
                refreshDiagram();
            })
            .finally(() => {
                setShowLoader(false);
                onSave();
            });
    }

    return (
        <Container isLoading={showLoader}>
            {pulling && !error && (
                <LoadingWrapper>
                    <PullingModuleLoader />
                    <LoaderTitle>Pulling {connector.moduleName} package</LoaderTitle>
                    <LoaderSubtitle>This might take some time</LoaderSubtitle>
                </LoadingWrapper>
            )}
            {!pulling && !error && (
                <DetailContainer>
                    <IconCard>
                        <ModuleIcon module={connector} />
                        <IconCardContent>
                            <ConnectorName>{moduleName}</ConnectorName>
                            <OrgName>by {connector.package.organization}</OrgName>
                        </IconCardContent>
                    </IconCard>
                    <ConnectorDetails>{connector.package.summary}</ConnectorDetails>
                    <ActionContainer>
                        <CreateButton label={`Add Connector`} onClick={handleConnectorSave} color={Colors.PRIMARY} disabled={showLoader}/>
                    </ActionContainer>
                </DetailContainer>
            )}
            {error && (
                <LoadingWrapper>
                    <ErrorTitle>{error}</ErrorTitle>
                </LoadingWrapper>
            )}

            {showLoader && <CircularProgress sx={{ top: "45%", left: "45%", position: "absolute", color: Colors.PRIMARY }} />}
        </Container>
    );
}

export default ConnectorForm;
