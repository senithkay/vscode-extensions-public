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

import React, { useContext, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { DiagramContext } from '../../../components/common';
import { TextInputWidget } from './TextInput';
import { ControlButton } from './ControlButtons';
import { AddComponentDetails } from '../../../resources';
import {
    ButtonColor, OrganizationRegex, OrganizationRules, PackageNameRegex, PackageNameRules, VersioningRules, VersionRegex
} from '../resources/constants';
import { AdvancedSettings, AdvancedControlsContainer, AdvancedControlsHeader, AdvancedHeaderTitle } from '../resources/styles';

interface AdvancedSettingsProps {
    component: AddComponentDetails;
    visibility: boolean;
    changeVisibility: (status: boolean) => void;
    updatePackage: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateOrganization: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    updateVersion: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    setDirectory: (path: string) => void;
    selectDirectory: () => void;
}

export function AdvancedSettingsWidget(props: AdvancedSettingsProps) {
    const {
        component,
        visibility,
        changeVisibility,
        updatePackage,
        updateOrganization,
        updateVersion,
        setDirectory,
        selectDirectory
    } = props;
    const { getProjectRoot } = useContext(DiagramContext);

    useEffect(() => {
        async function getDefaultDirectory() {
            const projectRoot = await getProjectRoot();
            setDirectory(projectRoot);
        }
        getDefaultDirectory();
    }, [])

    return (
        <AdvancedSettings>
            <AdvancedControlsHeader onClick={() => changeVisibility(!visibility)}>
                <AdvancedHeaderTitle>More</AdvancedHeaderTitle>

                <IconButton color='default' onClick={() => changeVisibility(!visibility)}>
                    {visibility ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
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

                    <TextInputWidget
                        label={'Directory'}
                        value={component.directory}
                        readonly={true}
                    />

                    <AdvancedControlsContainer>
                        <ControlButton
                            label={'Select'}
                            onClick={selectDirectory}
                            color={ButtonColor}
                            disabled={false}
                        />
                    </AdvancedControlsContainer>
                </>
            }
        </AdvancedSettings>
    );
}
