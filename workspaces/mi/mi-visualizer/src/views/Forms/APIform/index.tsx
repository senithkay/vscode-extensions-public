/*
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { AutoComplete, Button, Codicon, TextField, Typography, CheckBox } from "@wso2-enterprise/ui-toolkit";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { FieldGroup, SectionWrapper } from "../Commons";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { Range } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getXML } from "../../../utils/template-engine/mustache-templates/templateUtils";
import { SERVICE } from "../../../constants";
import Handler from "./Handler";

const WizardContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 95vw;
    height: calc(100vh - 140px);
    overflow: auto;
`;

const ActionContainer = styled.div`
    display  : flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: 10px;
    padding-bottom: 20px;
`;

const TitleBar = styled.div({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
});

const LocationText = styled.div`
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Container = styled.div`
    display: flex;
    flex-direction: row;
    height: 50px;
    align-items: center;
    justify-content: flex-start;
`;

export interface Region {
    label: string;
    value: string;
}

export interface APIData {
    apiName: string;
    apiContext: string;
    hostName?: string;
    port?: string;
    trace?: boolean;
    statistics?: boolean;
    version?: string;
    swaggerdefPath?: string;
    apiRange: Range;
    handlersRange?: Range;
    handlers?: [];
}

export interface APIWizardProps {
    apiData?: APIData;
    path: string;
}

type VersionType = "none" | "context" | "url";

export function APIWizard({ apiData, path }: APIWizardProps) {
    const { rpcClient } = useVisualizerContext();
    const [apiName, setAPIName] = useState("");
    const [apiContext, setAPIContext] = useState("/");
    const [hostName, setHostName] = useState("");
    const [port, setPort] = useState("");
    const [trace, setTrace] = useState(false);
    const [statistics, setStatistics] = useState(false);
    const [versionType, setVersionType] = useState("none");
    const [version, setVersion] = useState("");
    const [swaggerdefPath, setSwaggerdefPath] = useState("");

    const [handlers, setHandlers] = useState([]);

    const identifyVersionType = (version: string): VersionType => {
        if (!version) {
            return "none";
        } else if (version.startsWith("http")) {
            return "url";
        } else {
            return "context";
        }
    }

    useEffect(() => {
        if (apiData) {
            const versionType = identifyVersionType(apiData.version);

            setAPIName(apiData.apiName);
            setAPIContext(apiData.apiContext);
            setVersionType(versionType);
            setVersion(apiData.version);
            setSwaggerdefPath(apiData.swaggerdefPath);
            setHostName(apiData.hostName);
            setPort(apiData.port);
            setTrace(apiData.trace ?? false);
            setStatistics(apiData.statistics ?? false);
            setHandlers(apiData.handlers ?? []);
        }
    }, [apiData]);

    const versionLabels = ['none', 'context', 'url'];

    const handleVersionTypeChange = (type: string) => {
        setVersionType(type);
    };

    const addNewHandler = () => {
        if (handlers.length === 0) {
            setHandlers([{ name: "", properties: [] }]);
            return;
        }

        const lastHandler = handlers[handlers.length - 1];
        if (lastHandler.name === "" || lastHandler.properties.length === 0) return;
        setHandlers([...handlers, { name: "", properties: [] }]);
    }

    const handleCreateAPI = async () => {
        if (!apiData) {
            // Create API
            const projectDir = (await rpcClient.getMiDiagramRpcClient().getProjectRoot({ path: path })).path;
            const APIDir = `${projectDir}/src/main/wso2mi/artifacts/apis`;
            const createAPIParams = {
                name: apiName,
                context: apiContext,
                directory: APIDir,
                swaggerDef: swaggerdefPath,
                type: versionType,
                version: version
            }
            const file = await rpcClient.getMiDiagramRpcClient().createAPI(createAPIParams);
            console.log("API created");
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: file.path } });
        } else {
            // Update API
            const formValues = {
                name: apiName,
                context: apiContext,
                version_type: versionType,
                version: version,
                hostName,
                port: port === "0" ? undefined : port,
                trace: trace ? "enable" : undefined,
                statistics: statistics ? "enable" : undefined,
            }
            const xml = getXML(SERVICE.EDIT_SERVICE, formValues);
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text: xml,
                documentUri: path,
                range: apiData.apiRange
            });

            const handlersXML = getXML(SERVICE.EDIT_HANDLERS, { show: handlers.length > 0, handlers });
            await rpcClient.getMiDiagramRpcClient().applyEdit({
                text: handlersXML,
                documentUri: path,
                range: apiData.handlersRange
            });
            rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.ServiceDesigner, documentUri: path } });
        }
    };

    const handleCancel = () => {
        rpcClient.getMiVisualizerRpcClient().openView({ type: EVENT_TYPE.OPEN_VIEW, location: { view: MACHINE_VIEW.Overview } });
    };

    const handleSwaggerPathSelection = async () => {
        const projectDirectory = await rpcClient.getMiDiagramRpcClient().askProjectDirPath();
        setSwaggerdefPath(projectDirectory.path);
    }

    const validateAPIName = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Name is required";
        }

        // Check if the name has spaces
        if (/\s/.test(name)) {
            return "Name cannot contain spaces";
        }

        return "";
    };

    const validateAPIContext = (name: string) => {
        // Check if the name is empty
        if (!name.trim()) {
            return "Context is required";
        }

        // Check if the name has spaces
        if (/\s/.test(name)) {
            return "Context cannot contain spaces";
        }

        // Check if the name starts with /
        if (!name.startsWith("/")) {
            return "Context should start with /";
        }

        return "";
    }

    const handleBackButtonClick = () => {
        rpcClient.getMiVisualizerRpcClient().goBack();
    }

    const isValid: boolean = !validateAPIName(apiName) && !validateAPIContext(apiContext) && versionType.length > 0;
    const contentUpdated: boolean = apiData ?
        (apiData.apiName !== apiName)
        || (apiData.apiContext !== apiContext)
        || (apiData.hostName !== hostName)
        || (apiData.port !== port)
        || (apiData.trace !== trace)
        || (apiData.statistics !== statistics)
        || (apiData?.version ? apiData?.version !== version : false)
        || (apiData?.swaggerdefPath ? apiData?.swaggerdefPath !== swaggerdefPath : false)
        || (JSON.stringify(apiData?.handlers) !== JSON.stringify(handlers))
        : true;

    return (
        <WizardContainer>
            <SectionWrapper>
                <Container>
                    <Codicon iconSx={{ marginTop: -3, fontWeight: "bold", fontSize: 22 }} name='arrow-left' onClick={handleBackButtonClick} />
                    <div style={{ marginLeft: 30 }}>
                        <Typography variant="h3">{apiData && "Edit "}Synapse API Artifact</Typography>
                    </div>
                </Container>
                <TextField
                    value={apiName}
                    id='name-input'
                    label="Name"
                    placeholder="Name"
                    onTextChange={(text: string) => setAPIName(text)}
                    errorMsg={validateAPIName(apiName)}
                    size={100}
                    autoFocus
                    required
                />
                <TextField
                    placeholder="Context"
                    label="Context"
                    onTextChange={(text: string) => setAPIContext(text)}
                    value={apiContext}
                    id='context-input'
                    required
                    errorMsg={validateAPIContext(apiContext)}
                    size={46}
                />
                {apiData && <>
                    <TextField
                        placeholder="Host Name"
                        label="Host Name"
                        onTextChange={(text: string) => setHostName(text)}
                        value={hostName}
                        id='host-name-input'
                        size={46}
                    />
                    <TextField
                        placeholder="Port"
                        label="Port"
                        onTextChange={(text: string) => Number(text) ? setPort(text) : setPort("0")}
                        value={port}
                        id='port-input'
                        size={46}
                    />
                </>}
                <FieldGroup>
                    <AutoComplete sx={{ width: '370px' }} label="Version Type" items={versionLabels} value={versionType} onValueChange={handleVersionTypeChange} />
                    {versionType !== "none" && (
                        <TextField
                            placeholder={versionType === "context" ? "0.0.1" : "https://example.com"}
                            label="Version"
                            onTextChange={(text: string) => setVersion(text)}
                            value={version}
                            id='version-input'
                            size={35}
                        />
                    )}
                </FieldGroup>
                {apiData && <>
                    <CheckBox
                        label="Trace Enabled"
                        value={String(trace)}
                        checked={trace}
                        onChange={(checked: boolean) => setTrace(checked)}
                    />
                    <CheckBox
                        label="Statistics Enabled"
                        value={String(statistics)}
                        checked={statistics}
                        onChange={(checked: boolean) => setStatistics(checked)}
                    />
                    <FieldGroup>
                        <TitleBar>
                            <span>Handlers</span>
                            <Button
                                appearance="primary"
                                onClick={addNewHandler}
                            >
                                Add Handler
                            </Button>
                        </TitleBar>
                        {handlers.map((handler, index) => (
                            <Handler
                                key={index}
                                id={index}
                                last={handlers.length - 1}
                                handler={handler}
                                setHandlers={setHandlers}
                            />
                        ))}
                    </FieldGroup>
                </>}
                <FieldGroup>
                    <span>  Swagger Def Path  </span>
                    {!!swaggerdefPath ? <LocationText>{swaggerdefPath}</LocationText> : <span>Please choose a directory for swagger definition. </span>}
                    <Button appearance="secondary" onClick={handleSwaggerPathSelection} id="select-swagger-path-btn">
                        Select Location
                    </Button>
                </FieldGroup>
                <ActionContainer>
                    <Button
                        appearance="secondary"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleCreateAPI}
                        disabled={!isValid || !contentUpdated}
                    >
                        {apiData ? "Update" : "Create"}
                    </Button>
                </ActionContainer>
            </SectionWrapper>
        </WizardContainer>
    );
}
