/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/* eslint-disable @typescript-eslint/naming-convention */
import { createMachine, assign, interpret } from 'xstate';
import * as vscode from 'vscode';
import { EVENT_TYPE, MachineStateValue, AI_MACHINE_VIEW, webviewReady, AIVisualizerLocation, MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { AiPanelWebview } from './webview';
import { RPCLayer } from '../RPCLayer';
import { StateMachine } from '../stateMachine';
import * as keytar from 'keytar';
import axios from 'axios';

interface ChatEntry {
    role: string;
    content: string;
    errorCode?: string;
}

interface AiMachineContext extends AIVisualizerLocation {
    token: string | undefined;
    errorMessage?: string;
    errorCode?: string;
    chatLog: ChatEntry[];
}

const aiStateMachine = createMachine<AiMachineContext>({
    /** @xstate-layout N4IgpgJg5mDOIC5QFsCWBaAhqgdASQDtUAXVTAG1QC8wBiCAewLB1QIDcGBrFtLXQiTKUaCNpwDGmUkwDaABgC6CxYlAAHBrCFM1IAB6IATEYAsOAJwBmAOwBWeaZs2rFm-Lt2ANCACeiGwA2QJw7KysjeXkLAA4Y0wt5AEYAXxSfPmx8IlIKajpGZlYObl4MLMFckTAxEqkZAhVZJNUkEE1tBr1DBCMLEJsY+3lA0zshmLsbH38ECz6cd3k+1xikvs80jPKBHOF82jAAJyOGI5x1cmkAMzPkHEzdoTzRcQZ61DklFT0OnQJuohAjFFjYkuEostAvIYvJpn5EEk4fJLKZbEYhs4nEYtiBHjhyAwoDAIAB5ACuxFoABlSQBxPAAOR+bT+XTaPQsphRySSozsJmSgQs3gRCCSSXioJFkqspjMphiOPSeJ2OAASmBMBBfDT6aSAKoAFRZGi0-0BCDsiRwRkCfLWgRcSRcMRmASsdhw0SmNjMGLlcVx+M12t1AFEABrhgDCxvDpva5vZoB663coKMdmhdklNic7qtGO9SXlTmdGPBwbVoZ1tBj1PDAEF1Ym2Z8ARzEeEQaYkhZYn35BEYoFC36QtFEnCjEkwn3ldt+DgAOrYUgEKAAMTO1KJbHoTBYbx4DzVa6Em53Rz3UDYtUk0g7TSUv2THctSO53qcMUSVmhNFwkLIYBnGRIkSmcsbGrZcLw3bdd33AhDhOM4LiuYhbiOe58XgthEJvZCH3eJ8vmUV9WXfXQuwQSYLBwJFoTtFwjHCF0QLCSwe36J1hQ8WCsnwq8kLvFCYybRkY3Dak22oztUwCGwGL6Cx+z-F0ISMQsJVnb0ljtQIIjtOxBNwYTCNvA8tybPBqTwcNW0os1Og-WinRU4JImFfohjsUwdKiAZTBzdwrElKYzJwcN9DACRKQI+tSQAWQABUbI0E2cpNXJoxTxSMFxQmUl0EmBEUjMLPsQRiKx4n7cZuRdKKYrihLN1oRz1VJJzWhci1aPWP8cD-ZTPSdMw4kLADzGiExnDUtx+k9FrYvihDaAAZSNUlUrk3KFIMRE+nMYF-L6YVfTGQs+hsYr7FiQratGQJVrajbaTpcMABFDRNbL2zyo7xTlIxFn7FwHCzDx1h0qxHBwe1lLWf0-0cNIVQIBgIDgPRHjfA7LXQeHGLqv0-X8sI1MCbSxVnFFCvsP9mOCBqosqfYaAJgb8vlEDauK3MlmSELFSiwliUgCliG5lNgetBjJTcOcEkxJUdJdFT4cGfMB1U16VRDLUdVltz8sgsGhkVNYpmSKYLELAUwezWEIWhcLlKiiBUFgTAACNyEgU2gbTO7R3TQqxhCmE6o1yZGNqiIRjR0coos68rMOwHDp6NYrEsMw1MmDF+hcQtHtRHMFy5JG3vWgjg5zxEwnzyYYXmEZXBMx2TFCYFh3h93NYxlIgA */
    id: 'mi-ai',
    initial: "Initialize",
    predictableActionArguments: true,
    context: {
        token: undefined,
        chatLog: [],
        errorCode: undefined,
        errorMessage: undefined
    },
    states: {
        Initialize: {
            invoke: {
                src: "checkToken",
                onDone: [
                    {
                        cond: (context, event) => event.data !== undefined, // Token is valid
                        target: "Ready",
                        actions: assign({
                            token: (context, event) => event.data
                        })
                    },
                    {
                        cond: (context, event) => event.data === undefined, // No token found
                        target: 'loggedOut'
                    }
                ],
                onError: {
                    target: 'disabled',
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
                }
            }
        },

        loggedOut: {
            on: {
                LOGIN: {
                    target: "WaitingForLogin",
                }
            }
        },

        Ready: {
            invoke: {
                src: 'getSuggestions',
                onDone: {
                    target: "Ready"
                },
                onError: {
                    target: "Ready",
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
                }
            },
            on: {
                LOGOUT: "loggedOut",
                EXECUTE: "Executing",
                CLEAR: {
                    target: "Ready",
                }
            }
        },

        disabled: {
            invoke: {
                src: 'disableExtension'
            },
        },

        WaitingForLogin: {
            invoke: {
                src: 'openLogin',
                onDone: {
                    target: "Ready"
                },
                onError: {
                    target: "loggedOut",
                    actions: assign({
                        errorCode: (context, event) => event.data
                    })
                }
            },
            on: {
                SIGNINSUCCESS: "Ready",
                CANCEL: "loggedOut",
                FAILIER: "loggedOut"
            }
        },

        Executing: {
            on: {
                COMPLETE: "Ready",
                ERROR: "Ready",
                STOP: "Ready",
                LOGEDOUT: "loggedOut"
            }
        }
    }
}, {
    services: {
        checkToken: checkToken,
        openLogin: openLogin,
    }
});


async function checkToken(context, event) {
    return new Promise(async (resolve, reject) => {
        try {
            const token = await keytar.getPassword('MI-AI', 'MIAIUser');
            if (token) {
                console.log("Token found: " + token);
                resolve(token);
            } else {
                resolve(undefined);
            }
        } catch (error) {
            reject(error);
        }
    });
}



async function openLogin(context, event) {
    return new Promise(async (resolve, reject) => {
        try {
            initiateInbuiltAuth();
        } catch (error) {
            reject(error);
        }
    });
}

async function getAuthUrl(callbackUri: string): Promise<string> {
    // const state = {
    //     origin: "vscode.choreo.ext",
    //     callbackUri: callbackUri
    // };
    // const stateBase64 = Buffer.from(JSON.stringify(state), 'binary').toString('base64');

    // return `${this._config.loginUrl}?profile=vs-code&client_id=${this._config.clientId}`
    //     + `&state=${stateBase64}&code_challenge=${this._challenge.code_challenge}`;

    return "https://api.asgardeo.io/t/wso2mi/oauth2/authorize?response_type=code&redirect_uri=vscode%3A%2F%2Fwso2.micro-integrator%2Fsignin&client_id=yo29V9jLN83xmVCNvlRQ_QGfvcka&scope=openid";
}

async function initiateInbuiltAuth() {
    const callbackUri = await vscode.env.asExternalUri(
        vscode.Uri.parse(`${vscode.env.uriScheme}://wso2.micro-integrator/signin`)
    );
    const oauthURL = await getAuthUrl(callbackUri.toString());
    return vscode.env.openExternal(vscode.Uri.parse(oauthURL));
}

export interface AccessToken {
    accessToken : string;
    expirationTime? : number;
    loginTime : string;
    refreshToken? : string;
}

const CommonReqHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
    'Accept': 'application/json'
};

async function exchangeAuthCodeNew(authCode: string): Promise<AccessToken> {
    const params = new URLSearchParams({
        client_id: 'yo29V9jLN83xmVCNvlRQ_QGfvcka',
        code: authCode,
        grant_type: 'authorization_code',
        redirect_uri: 'vscode://wso2.micro-integrator/signin',
    });
    try {
        const response = await axios.post('https://api.asgardeo.io/t/wso2mi/oauth2/token', params.toString(), { headers: CommonReqHeaders });
        return {
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            loginTime: new Date().toISOString(),
            expirationTime: response.data.expires_in
        };
    } catch (err) {
        throw new Error(`Error while exchanging auth code to token: ${err}`);
    }
}


async function exchangeAuthCode(authCode: string) {
        if (!authCode) {
            throw new Error("Auth code is not provided.");
        } else {
            try {
                var currentTime = Date.now();
                console.log("Exchanging auth code to token...");
                const response = await exchangeAuthCodeNew(authCode);
                console.log("Access token: " + response.accessToken);
                console.log("Refresh token: " + response.refreshToken);
                console.log("Login time: " + response.loginTime);
                console.log("Expiration time: " + response.expirationTime);
                await keytar.setPassword('MI-AI', 'MIAIUser', response.accessToken);
                aiStateService.send('SIGNINSUCCESS');
            } catch (error: any) {
                const errMsg = "Error while signing in to Choreo! " + error?.message;
                // getLogger().error(errMsg);
                // if (error?.cause) {
                //     getLogger().debug("Cause message: " + JSON.stringify(error.cause?.message));
                // }
                throw new Error(errMsg);
            }
        }
}

vscode.window.registerUriHandler({
    handleUri(uri: vscode.Uri) {
        if (uri.path === '/signin') {
            console.log("Signin callback hit");
            const query = new URLSearchParams(uri.query);
            const code = query.get('code');
            console.log("Code: " + code);
            if (code) {
                exchangeAuthCode(code);
            } else {
                // Handle error here
            }
        }
    }
});

// Create a service to interpret the machine
export const aiStateService = interpret(aiStateMachine);

// Define your API as functions
export const StateMachineAI = {
    initialize: () => aiStateService.start(),
    service: () => { return aiStateService; },
    context: () => { return aiStateService.getSnapshot().context; },
    state: () => { return aiStateService.getSnapshot().value as MachineStateValue; },
    sendEvent: (eventType: EVENT_TYPE) => { aiStateService.send({ type: eventType }); },
};

export function openAIView(type: EVENT_TYPE, viewLocation?: AIVisualizerLocation) {
    if (!AiPanelWebview.currentPanel) {
        AiPanelWebview.currentPanel = new AiPanelWebview();
    } else {
        AiPanelWebview.currentPanel!.getWebview()?.reveal();
    }
}

async function checkAiStatus() {
    return new Promise((resolve, reject) => {
        // Check for AI API status
        resolve(true);
    });
}

aiStateService.onTransition((state) => {
    console.log("State - " + state.value);
    if(state.value === "loggedOut") {
        aiStateService.send('LOGIN');
    }
}).start();

