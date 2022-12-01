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

import { AddComponentDetails } from '../../../resources';
import { PackageNameAntiRegex } from './constants';

export function transformComponentName(componentName: string): string {
    // processes the component name to match the package name conventions
    // eg: Test-hello-world -> TestHelloWorld
    return componentName.split(PackageNameAntiRegex).reduce((composedName: string, subname: string) =>
        composedName + subname.charAt(0).toUpperCase() + subname.substring(1).toLowerCase(), '');
}

export function initBallerinaComponent(): AddComponentDetails {
    return {
        name: '',
        directory: '',
        package: '',
        org: '',
        version: '0.1.0'
    };
}
