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
import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { VSCodeDropdown, VSCodeOption, VSCodeTextArea } from "@vscode/webview-ui-toolkit/react";
import { Step, StepProps } from "../Commons/MultiStepWizard/types";
import { ComponentWizardState } from "./types";
import { ChoreoWebViewAPI } from "../utilities/WebViewRpc";
import { BuildPackVersions, ChoreoComponentType, ChoreoImplementationType, ComponentAccessibility } from "@wso2-enterprise/choreo-core";
import { ConfigCardList } from "./ConfigCardList";
import { TextField } from "@wso2-enterprise/ui-toolkit";
import { SectionWrapper } from "../ProjectWizard/ProjectWizard";
import { useChoreoWebViewContext } from "../context/choreo-web-view-ctx";
import { BallerinaIcon, DockerIcon } from "../icons";

const StepContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-content: center;
    gap: 20px;
    width: 100%;
    min-width: 400px;
    min-height: calc(100vh - 160px);
`;

const DropDownContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

interface ComponentType {
    label: string;
    value: string;
}

const COMPONENT_TYPES: ComponentType[] = [
    { label: "service", value: "service" },
    { label: "scheduledTask", value: "scheduleTask" },
    { label: "manualTrigger", value: "manualTask" },
    { label: "webhook", value: "webhook" },
    { label: "webApplication", value: "webApp" }
];

function sanitizeFolderName(folderName: string): string {
    // Replace any characters that are not letters, numbers, spaces, or underscores with an empty string
    const sanitized = folderName.replace(/[^a-zA-Z0-9\s_]/g, '');

    // Remove any leading or trailing spaces
    const trimmed = sanitized.trim();

    // Replace any consecutive spaces with a dash
    const final = trimmed.replace(/\s+/g, '-');

    return final;
}

export const ComponentDetailsStepC = (props: StepProps<Partial<ComponentWizardState>>) => {
    const { formData, onFormDataChange, stepValidationErrors } = props;
    const [items, setItems] = useState([]);

    const { currentProjectOrg } = useChoreoWebViewContext();

    useMemo(async () => {
        // get component type keyword for request
        const componentType = COMPONENT_TYPES.find((component) => component.label === formData.type).value;

        const buildPackParams = {
            orgId: currentProjectOrg.id,
            componentType: componentType
        };

        const buildPacks = await ChoreoWebViewAPI.getInstance().getBuildpack(buildPackParams);

        const implementationTypes = buildPacks.map((buildPack) => {
            return {
                label: buildPack.displayName,
                description: buildPack.displayName,
                value: buildPack.language,
                icon: buildPack.iconUrl
            };
        });

        const supportedVersionsList: BuildPackVersions[] = buildPacks.map((buildPack) => {
            return {
                displayName: buildPack.language,
                supportedVersions: buildPack.supportedVersions.split(',')
            };
        });

        onFormDataChange(prevFormData => ({
            ...prevFormData,
            buildPack: { ...prevFormData.buildPack, supportedVersions: supportedVersionsList }
        }));

        setItems(implementationTypes);
    }, [formData.type]);

    const setComponentName = (name: string) => {
        onFormDataChange(prevFormData =>
        ({
            ...prevFormData, name,
            repository: {
                ...prevFormData.repository,
                subPath: prevFormData.mode === "fromScratch" ? sanitizeFolderName(name) : prevFormData?.repository?.subPath
            }
        }));
    };

    const setDescription = (description: string) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, description }));
    };

    const setAccessibility = (accessibility: ComponentAccessibility) => {
        onFormDataChange(prevFormData => ({ ...prevFormData, accessibility }));
    };

    return (
        <StepContainer>
            <SectionWrapper>
                <h3>Component Details</h3>
                <TextField
                    value={formData?.name || ''}
                    id='component-name-input'
                    label="Component Name"
                    placeholder="Name"
                    onChange={(text: string) => setComponentName(text)}
                    errorMsg={stepValidationErrors["name"]}
                    autoFocus
                    required
                />
                <VSCodeTextArea
                    autofocus
                    placeholder="Description"
                    onInput={(e: any) => setDescription(e.target.value)}
                    value={formData?.description || ''}
                >
                    Description
                </VSCodeTextArea>
                <div>
                    {formData.mode === "fromScratch" ? (<>
                        <p>How do you want to implement it?</p>
                        <ConfigCardList
                            formKey='implementationType'
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            items={[
                                {
                                    label: "Ballerina",
                                    description: "Component impelmented using Ballerina Language",
                                    value: ChoreoImplementationType.Ballerina,
                                    icon: BallerinaIcon
                                },
                                {
                                    label: "Docker",
                                    description: "Component impelmented using other language and built using Docker",
                                    value: ChoreoImplementationType.Docker,
                                    icon: DockerIcon
                                }
                            ]}
                        />
                    </>) : (<>
                        <p>Implementation Type</p>
                        <ConfigCardList
                            formKey='implementationType'
                            formData={formData}
                            onFormDataChange={onFormDataChange}
                            items={items}
                        />
                    </>)}
                    {formData?.type === ChoreoComponentType.Webhook && (
                        <DropDownContainer>
                            <label htmlFor="access-mode">Access Mode</label>
                            <VSCodeDropdown id="access-mode" onChange={(e: any) => setAccessibility(e.target.value)}>
                                <VSCodeOption value={'external'}><b>External:</b> API is publicly accessible</VSCodeOption>
                                <VSCodeOption value={'internal'}><b>Internal:</b> API is accessible only within Choreo</VSCodeOption>
                            </VSCodeDropdown>
                        </DropDownContainer>
                    )}
                </div>
            </SectionWrapper>
        </StepContainer>
    );
};

export const ComponentDetailsStep: Step<Partial<ComponentWizardState>> = {
    title: 'Component Details',
    component: ComponentDetailsStepC,
    validationRules: [
        {
            field: 'name',
            message: 'Component name is already taken',
            rule: async (value: any, _formData, context) => {
                const { isChoreoProject, choreoProject } = context;
                if (isChoreoProject && choreoProject && choreoProject?.id) {
                    return ChoreoWebViewAPI.getInstance().getChoreoProjectManager().isComponentNameAvailable(value);
                }
                return true;
            }
        },
        {
            field: 'name',
            message: 'Name is required',
            rule: async (value: any) => {
                return value !== undefined && value !== '';
            }
        },
    ]
};
