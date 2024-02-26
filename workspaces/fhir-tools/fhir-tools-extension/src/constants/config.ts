/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import { clearCachedToken } from '../services/auth';

dotenv.config();
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_APIKEY = process.env.CLIENT_SECRET;
const DEFAULT_TOKEN_ENDPOINT =
    'https://api.asgardeo.io/t/joelsathi/oauth2/token';
const DEFAULT_HL7v2_API =
    'https://7d0b44d3-c19e-443a-8984-bef909cae08e-dev.e1-us-east-azure.choreoapis.dev/pyvm/v2tofhir/endpoint-9090-803/v1.0/transform';
const DEFAULT_CDA_API =
    'https://7d0b44d3-c19e-443a-8984-bef909cae08e-dev.e1-us-east-azure.choreoapis.dev/pyvm/ccda-to-fhir/endpoint-9090-803/v1.0/transform';

export let APIKEY = DEFAULT_APIKEY;
export let TOKEN_ENDPOINT = DEFAULT_TOKEN_ENDPOINT;
export let HL7v2_API = DEFAULT_HL7v2_API;
export let CDA_API = DEFAULT_CDA_API;
export let ENABLE_AUTHORIZATION = vscode.workspace
    .getConfiguration()
    .get('fhir-tools.enableAuthorization') as boolean;

let user_settings = false;

/**
 * @description - Listen to configuration changes
 * @returns - void
 */
export function listenToConfigurationChanges() {
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (
            event.affectsConfiguration('fhir-tools.HL7v2_Api') ||
            event.affectsConfiguration('fhir-tools.CCDA_Api') ||
            event.affectsConfiguration('fhir-tools.tokenEndpoint') ||
            event.affectsConfiguration('fhir-tools.consumerKey') ||
            event.affectsConfiguration('fhir-tools.consumerSecret')
        ) {
            updateConfigs();
        }
        if (event.affectsConfiguration('fhir-tools.enableAuthorization')) {
            ENABLE_AUTHORIZATION = vscode.workspace
                .getConfiguration()
                .get('fhir-tools.enableAuthorization') as boolean;
        }
        if (event.affectsConfiguration('enableAuthorization')){
            ENABLE_AUTHORIZATION = vscode.workspace.getConfiguration().get('enableAuthorization') as boolean;
        }
    });
}

/**
 * @description - Update the configurations if the user changes the settings. If the user has not changed the settings, the default settings will be used.
 * @returns - void
 */
function updateConfigs() {
    let HL7v2_API_USER = vscode.workspace
        .getConfiguration()
        .get('fhir-tools.HL7v2_Api') as string;
    let CDA_API_USER = vscode.workspace
        .getConfiguration()
        .get('fhir-tools.CCDA_Api') as string;
    let TOKEN_ENDPOINT_USER = vscode.workspace
        .getConfiguration()
        .get('fhir-tools.tokenEndpoint') as string;
    let CONSUMER_KEY = vscode.workspace
        .getConfiguration()
        .get('fhir-tools.consumerKey') as string;
    let CONSUMER_SECRET = vscode.workspace
        .getConfiguration()
        .get('fhir-tools.consumerSecret') as string;
    let APIKEY_USER = Buffer.from(
        `${CONSUMER_KEY}:${CONSUMER_SECRET}`,
    ).toString('base64');

    if (
        (HL7v2_API_USER === '' || HL7v2_API_USER === undefined) &&
        (CDA_API_USER === '' || CDA_API_USER === undefined) &&
        (TOKEN_ENDPOINT_USER === '' || TOKEN_ENDPOINT_USER === undefined) &&
        (CONSUMER_KEY === '' || CONSUMER_KEY === undefined) &&
        (CONSUMER_SECRET === '' || CONSUMER_SECRET === undefined)
    ) {
        APIKEY = DEFAULT_APIKEY;
        TOKEN_ENDPOINT = DEFAULT_TOKEN_ENDPOINT;
        HL7v2_API = DEFAULT_HL7v2_API;
        CDA_API = DEFAULT_CDA_API;
        user_settings = false;
    } else {
        APIKEY = APIKEY_USER;
        TOKEN_ENDPOINT = TOKEN_ENDPOINT_USER;
        HL7v2_API = HL7v2_API_USER;
        CDA_API = CDA_API_USER;
        
        if (!user_settings){
            clearCachedToken();
        }
        user_settings = true;
    }
}
