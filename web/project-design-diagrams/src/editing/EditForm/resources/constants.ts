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

export const PackageNameRegex: RegExp = new RegExp('^[a-zA-Z0-9\.\_]+$');
export const OrganizationRegex: RegExp = new RegExp('^[a-zA-Z0-9\_]+$');
export const VersionRegex: RegExp = new RegExp('^[a-zA-Z0-9\.\-]+$');

export const PackageNameAntiRegex: RegExp = /[^a-zA-Z0-9_.]/g;

export const PackageNameRules: string = 'Should only contain alphanumerics, underscore, and period.';
export const OrganizationRules: string = 'Should only contain alphanumerics and underscore.';
export const VersioningRules: string = 'Should follow the SemVer best practices.';

export const ButtonColor: string = '#efeff5';
