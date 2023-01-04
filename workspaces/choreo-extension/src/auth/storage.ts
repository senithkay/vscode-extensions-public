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
import { ChoreoSessionConfig } from "./config";
import keytar = require("keytar");
import { ChoreoAccessToken } from "./types";
import { ChoreoToken, exchangeApimToken, exchangeRefreshToken } from "./inbuilt-impl";
import { ext } from "../extensionVariables";

export async function getChoreoToken(tokenKey: string): Promise<ChoreoAccessToken|undefined> {
    
    const currentChoreoToken = await _getChoreoToken(ChoreoToken);
    if (currentChoreoToken?.accessToken && currentChoreoToken.expirationTime
        && currentChoreoToken.loginTime && currentChoreoToken.refreshToken) {

        let tokenDuration = (new Date().getTime() - new Date(currentChoreoToken.loginTime).getTime()) / 1000;
        if (tokenDuration > currentChoreoToken.expirationTime) {
            await exchangeRefreshToken(currentChoreoToken.refreshToken);
            const newChoreoToken = await _getChoreoToken(ChoreoToken);
            if (newChoreoToken?.accessToken && ext.api.selectedOrg) {
                await exchangeApimToken(newChoreoToken?.accessToken, ext.api.selectedOrg?.handle);
            }
        }
    }
    return _getChoreoToken(tokenKey);
}

async function _getChoreoToken(tokenKey: string): Promise<ChoreoAccessToken|undefined> {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    let choreoAccessToken: string | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.accessToken).then((result) => {
        choreoAccessToken = result;
    });

    let choreoRefreshToken: string | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.refreshToken).then((result) => {
        choreoRefreshToken = result;
    });

    let choreoLoginTime: Date | null = null;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.loginTime).then((result) => {
        if (result !== null) {
            choreoLoginTime = new Date(result);
        }
    });

    let choreoTokenExpiration: number | undefined;
    await keytar.getPassword(serviceName, ChoreoSessionConfig.tokenExpiration).then((result) => {
        if (result !== null) {
            choreoTokenExpiration = Number(result);
        }
    });

    if (choreoAccessToken !== null && choreoRefreshToken !== null && choreoLoginTime !== null) {
        return {
            accessToken: choreoAccessToken,
            refreshToken: choreoRefreshToken,
            loginTime: choreoLoginTime,
            expirationTime: choreoTokenExpiration
        };
    }
}

export async function storeChoreoToken(tokenKey: string, accessToken: string, refreshToken: string, loginTime: string, expirationTime: string) {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    await keytar.setPassword(serviceName, ChoreoSessionConfig.accessToken, accessToken);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.refreshToken, refreshToken);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.loginTime, loginTime);
    await keytar.setPassword(serviceName, ChoreoSessionConfig.tokenExpiration, expirationTime);
}

export async function deleteChoreoToken(tokenKey: string) {
    const serviceName = ChoreoSessionConfig.serviceName + tokenKey;
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.accessToken);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.refreshToken);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.loginTime);
    await keytar.deletePassword(serviceName, ChoreoSessionConfig.tokenExpiration);
}
