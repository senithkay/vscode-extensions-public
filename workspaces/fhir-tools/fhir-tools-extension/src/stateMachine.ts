import { createMachine, assign, interpret } from 'xstate';
import API, { handleError } from './services/convert';
import {v4 as uuidv4} from 'uuid';
import { WebView } from './WebView/WebView';
import { Logger } from './logger/logger';
import * as vscode from 'vscode';

export interface StateMachineContext {
    xRequestId?: string;
    convType?: string;
    inputData?: string;
    outputData?: string;
    error?: string;
    curState?: string;
}

interface SetInputDataEvent {
    type: 'SET_INPUT_DATA';
    inputData: string;
    convType: string;
}   

const assignInputData = assign<StateMachineContext, SetInputDataEvent>({
    xRequestId: (context, event) => uuidv4(),
    inputData: (context, event) => event.inputData,
    convType: (context, event) => event.convType,
    curState: (context, event) => 'Loading'
});

const reloadInputData = async (context: StateMachineContext, event: any) => {
    const newData = vscode.window.activeTextEditor?.document.getText();
    context.inputData = newData;
};

const convert = async (context: StateMachineContext, event: any) => {
    Logger.log({message: 'Converting the input data', type: 'INFO'});
    return new Promise((resolve, reject) => {
        API.ready(context.convType)
            .then((instance) => {
                instance
                    .post('', context.inputData)
                    .then((response) => {
                        Logger.log({message: 'Conversion successful', type: 'INFO'});
                        resolve({"outputData": JSON.stringify(response.data, null, 2)});
                    })
                    .catch((error) => {
                        Logger.log({message: 'Conversion failed', type: 'ERROR'});
                        const errMsg = handleError(error.response, context.convType).split('::LOG::');
                        Logger.log({message: errMsg[1], type: 'ERROR'});
                        reject({"error": errMsg[0]});
                    });
            })
            .catch((error) => {
                Logger.log({message: 'Conversion failed', type: 'ERROR'});
                const errMsg = handleError(error.response, context.convType).split('::LOG::');
                Logger.log({message: errMsg[1], type: 'ERROR'});
                reject({"error": errMsg[0]});
            });
    });
};

const dispalyOutput = (context: StateMachineContext, event: any) => {
    if (!WebView.currentPanel) {
        WebView.currentPanel = new WebView();
    }
    Logger.log({message: 'Displaying the output', type: 'INFO'});
    WebView.currentPanel!.setOutputData(context.outputData!);
    WebView.currentPanel!.getWebview()?.reveal();
};

const displayError = (context: StateMachineContext, event: any) => {
    if (!WebView.currentPanel) {
        WebView.currentPanel = new WebView();
    }
    Logger.log({message: 'Displaying the error', type: 'INFO'});
    WebView.currentPanel!.getWebview()?.reveal(); 
};

const displayLoading = (context: StateMachineContext, event: any) => {
    if (!WebView.currentPanel) {
        WebView.currentPanel = new WebView();
    }
    Logger.log({message: 'Displaying the loading screen', type: 'INFO'});
    WebView.currentPanel!.getWebview()?.reveal();
};

const stateMachine = createMachine({
    /** @xstate-layout N4IgpgJg5mDOIC5QDMAWBLATgFQPa4BtYA6dAO3QBd0BDA9ALzAGIBhAeQDkA1AUQCVsAbQAMAXUSgADrlhV0uMpJAAPRACYAnJuIBmdVoAsWgKwAOAOz6ANCACeiALS6dht290n9FgIzGfAL4BtmhYeIQkADK4NBDkUMwQimCkZABuuADWKQDGimlgmJSiEkggMnLUispqCIY+xOpmuj4WAGzGIiYW7W22DnU+6sRmZpq6loYtJl5eQSEYOPhExNGx8cyFmLiYxFIENJTIOwC2xHnphcXiyhXy1WW1PpoixL0GIqMiul2a-YgeRrqHxmdT1CxmNoWETfeYgUJLCLEAAi6Fg+xodnYAFdKFJcWwuHxBCVbrJ7kpHhozCNmjMzD42m0RBYpmZ-ghXhZxr4RENmR02iYtHCEeEVrxMNtMMx+LxsPwAJqksp3KqU0C1XTc4jGMws7WfPm+DnGQy65q6XSGMzuNpjUWLcUkSXSwk8ATCG6q8nqmpORkWYiMgyabntEQdMwmDnPYaWETaCYTESGVkWILBEBkXAQODKMXLeA+yoKDWqJzAkzBtqh8MCm0x+wB9RtEZNIYmQyR7XAx1hIupeR0RhgMmlh6axC9kY+TyRmY+HwidTtWNC4gmb6pj6aNrLsz9xErNZxMhQccU-11c3tCxbpdphn6dnNhDPBpLll774MvndI9nRRNEMSxXF8UoS8-SpBBHD8at7QMaMDB+LwWQ5ZwdAhLRITTO8mkPLNCyRV0digstrzglxiETbsIS3UF-FfAZzC5a16nULxOJcdRMwCIA */
    id: 'fhirTools',
    initial: 'initialize',
    predictableActionArguments: true,
    schema:{
        context: {} as StateMachineContext
    },
    context: {
        inputData: undefined,
        convType: undefined
    },
    states: {
        initialize: {
            on:{
                CONVERT:{
                    target: 'Loading',
                    actions: assignInputData
                }
            }
        },

        Loading:{
            entry: displayLoading,
            invoke:{
                id: 'convert',
                src: convert, 
                onDone:{
                    target: 'DisplayOutput',
                    actions: assign({
                        outputData: (context, event) => event.data.outputData,
                        curState: 'DisplayOutput'
                    })
                },
                onError:{
                    target: 'Error',
                    actions: assign({
                        error: (context, event) => event.data.error
                    })
                }
            }
        },

        DisplayOutput:{
            entry: dispalyOutput,
            on:{
                CONVERT:{
                    target: 'Loading',
                    actions: assignInputData
                }
            }
        },

        Error:{
            entry: displayError,
            on:{
                RETRY:{
                    target: 'Loading',
                    actions: reloadInputData
                }, 
                CONVERT:{
                    target: 'Loading',
                    actions: assignInputData
                }
            }
        }
    }
});

let service = interpret(stateMachine);
service.start();

export function getService(){
    return service;
}

export function convertToFHIR(inputData: string, convType: string){
    service.send({type: 'CONVERT', inputData, convType});
}

export function retryConversion(){
    service.send({type: 'RETRY'});
}
