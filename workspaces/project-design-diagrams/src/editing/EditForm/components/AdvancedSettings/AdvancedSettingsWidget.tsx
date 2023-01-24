/**
 * Copyright (c) 2022, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
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

import React, { useEffect, useState } from 'react';
import { TextInputWidget } from '../InputWidget/TextInput';
import { DirectoryPicker } from './DirectoryPicker';
import { VisibilityButton } from '../Controls/VisibilityButton';
import { AddComponentDetails } from '../../../../resources';
import { ProjectDesignRPC } from '../../../../utils/rpc/project-design-rpc';
import {
    OrganizationRegex, OrganizationRules, PackageNameRegex, PackageNameRules, VersioningRules, VersionRegex
} from '../../resources/constants';
import { AdvancedSettings, AdvancedControlsHeader, TitleText } from '../../resources/styles';

interface AdvancedSettingsProps {
    component: AddComponentDetails;
    updatePackage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateOrganization: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateVersion: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setDirectory: (path: string) => void;
    selectDirectory: () => void;
}

export function AdvancedSettingsWidget(props: AdvancedSettingsProps) {
    const [visibility, changeVisibility] = useState<boolean>(false);
    const { component, updatePackage, updateOrganization, updateVersion, setDirectory, selectDirectory } = props;

    useEffect(() => {
        const rpcInstance = new ProjectDesignRPC((window as any).vscode);
        rpcInstance.getProjectRoot().then((response) => {
            setDirectory(response);
        });
    }, [])

    return (
        <AdvancedSettings>
            <AdvancedControlsHeader>
                <TitleText>More</TitleText>

                <VisibilityButton
                    onClick={changeVisibility}
                    visibility={visibility}
                />
            </AdvancedControlsHeader>

            {visibility &&
                <>
                    <TextInputWidget
                        label={'Package Name'}
                        value={component.package}
                        required={true}
                        error={!PackageNameRegex.test(component.package)}
                        errorMessage={PackageNameRules}
                        onChange={updatePackage}
                    />

                    <TextInputWidget
                        label={'Organization'}
                        value={component.org}
                        required={true}
                        error={!OrganizationRegex.test(component.org)}
                        errorMessage={OrganizationRules}
                        onChange={updateOrganization}
                    />

                    <TextInputWidget
                        label={'Version'}
                        value={component.version}
                        required={true}
                        error={!VersionRegex.test(component.version)}
                        errorMessage={VersioningRules}
                        onChange={updateVersion}
                    />

                    <DirectoryPicker
                        component={component}
                        selectDirectory={selectDirectory}
                    />
                </>
            }
        </AdvancedSettings>
    );
}
