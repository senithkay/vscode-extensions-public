import { createElement } from "react";
import { render } from "react-dom";

import { BalleriaLanguageClient, WSConnection } from "@wso2-enterprise/ballerina-languageclient";

import { DiagramGeneratorProps } from "../DiagramGenerator";

import { DiagramGeneratorWrapper } from "./DiagramGeneratorWrapper";
import { StandaloneDiagramApp } from "./StandaloneDiagramApp";

export const MOCK_SERVER_URL = "http://localhost:3000"
export const LANG_SERVER_URL = "ws://localhost:9095"

export const langClientPromise = WSConnection.initialize(LANG_SERVER_URL).then((wsConnection: WSConnection) => {
  return new BalleriaLanguageClient(wsConnection);
});

export async function getFileContent(filePath: string): Promise<string> {
    return fetch(MOCK_SERVER_URL + "/file/" + encodeURIComponent(filePath))
      .then(response => {
        return response.text()
      })
}

export async function updateFileContent(filePath: string, text: string): Promise<boolean> {
  return fetch(MOCK_SERVER_URL + "/file/" + encodeURIComponent(filePath),
    {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ text })
    })
    .then(response => {
      return response.json()
    }).then(result => result.success);
}

export function getDiagramGeneratorProps(filePath: string, enableSave: boolean = false): DiagramGeneratorProps {
  return {
    langClientPromise,
    scale: "1",
    panX: "0",
    panY: "0",
    filePath,
    startColumn: 0,
    startLine: 0,
    getFileContent,
    getPFSession: () => Promise.resolve(undefined),
    getPerfDataFromChoreo: () =>  Promise.resolve(undefined),
    gotoSource: () => Promise.resolve(false),
    lastUpdatedAt: (new Date()).toISOString(),
    resolveMissingDependency: () => Promise.resolve(false),
    resolveMissingDependencyByCodeAction: () => Promise.resolve(false),
    runCommand: () => Promise.resolve(false),
    sendTelemetryEvent: () => Promise.resolve(undefined),
    showMessage: () => Promise.resolve(false),
    showPerformanceGraph: () => Promise.resolve(false),
    updateFileContent: enableSave ? updateFileContent : () => Promise.resolve(undefined),
    getLibrariesList: () => Promise.resolve(undefined),
    getLibrariesData: () => Promise.resolve(undefined),
    getLibraryData: () => Promise.resolve(undefined),
    getSentryConfig: () => Promise.resolve(undefined)
  }
}


export function renderStandaloneMockedEditor(container: string) {
    const element = createElement(StandaloneDiagramApp);
    render(element, document.getElementById(container));
}
