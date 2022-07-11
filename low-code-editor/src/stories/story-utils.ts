import { createElement } from "react";
import { render } from "react-dom";

import { BalleriaLanguageClient, WSConnection } from "@wso2-enterprise/ballerina-languageclient";
import { ANALYZE_TYPE, LibraryDataResponse, LibraryDocResponse, LibraryKind, LibrarySearchResponse, PerformanceAnalyzerGraphResponse, PerformanceAnalyzerRealtimeResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { Uri } from "monaco-editor";

import { DiagramGeneratorProps } from "../DiagramGenerator";

import balDist from "./data/baldist.json";
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
    getPerfDataFromChoreo: generatePerfData,
    gotoSource: () => Promise.resolve(false),
    lastUpdatedAt: (new Date()).toISOString(),
    resolveMissingDependency: async () => {
      const langClient = await langClientPromise;
      return langClient.resolveMissingDependencies({
        documentIdentifier: {
          uri: Uri.file(filePath).toString()
        }
      });
    },
    resolveMissingDependencyByCodeAction: () => Promise.resolve(false),
    runCommand: () => Promise.resolve(false),
    runBackgroundTerminalCommand: () => Promise.resolve({error: false, message: ""}),
    sendTelemetryEvent: () => Promise.resolve(undefined),
    showMessage: () => Promise.resolve(false),
    showPerformanceGraph: () => Promise.resolve(false),
    updateFileContent: enableSave ? updateFileContent : () => Promise.resolve(undefined),
    getLibrariesList: () => Promise.resolve(undefined),
    getLibrariesData: () => Promise.resolve(undefined),
    getLibraryData: () => Promise.resolve(undefined),
    getSentryConfig: () => Promise.resolve(undefined),
    getEnv: (name: string) => Promise.resolve(undefined),
    experimentalEnabled: true
  }
}


export function renderStandaloneMockedEditor(container: string) {
    const element = createElement(StandaloneDiagramApp);
    render(element, document.getElementById(container));
}

export function getProjectRoot() {
  const balDistObj = balDist as any;
  return balDistObj.projectRoot;
}

export async function getLibrariesList(kind?: LibraryKind): Promise<LibraryDocResponse> {
  return fetch(MOCK_SERVER_URL + "/libs/list" + (kind ? "?kind=" + kind : ""))
    .then(response => {
      return response.json()
    });
}

export async function getLibrariesData(): Promise<LibrarySearchResponse> {
  return fetch(MOCK_SERVER_URL + "/libs/data")
    .then(response => {
      return response.json()
    });
}

export async function getLibraryData(orgName: string, moduleName: string, version: string): Promise<LibraryDataResponse> {
  return fetch(MOCK_SERVER_URL + `/lib/data`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ orgName, moduleName, version })
    })
    .then(response => {
      return response.json()
    });
}

export function generatePerfData(data: any, analyzeType: ANALYZE_TYPE): Promise<PerformanceAnalyzerRealtimeResponse | PerformanceAnalyzerGraphResponse> {
  if (analyzeType === ANALYZE_TYPE.REALTIME) {
    if (data.resourcePos.start.line === 20) {
      return Promise.resolve({
        concurrency: { max: 50, min: 1 }, latency: { max: 3738, min: 46 }, tps: { max: 21.66, min: 8.28 }, message: undefined, type: undefined });
    }
    return Promise.resolve({
      concurrency: { max: 1, min: 1 }, latency: { max: 3738, min: 46 }, tps: { max: 21.66, min: 8.28 }, message: undefined, type: undefined });

  } else {
    return Promise.resolve({
      graphData: [
        { concurrency: "1", latency: "137", tps: "7.28" },
        { concurrency: "25", latency: "2399", tps: "10.42" },
        { concurrency: "50", latency: "4366", tps: "11.45" },
        { concurrency: "75", latency: "6638", tps: "11.3" },
        { concurrency: "100", latency: "9213", tps: "10.85" }
      ],
      sequenceDiagramData: [
        { concurrency: "1", values: [{ latency: 46, name: "sample.bal/(22:33,22:67)", tps: 7.28 }, { latency: 45, name: "sample.bal/(24:34,24:68)", tps: 7.28 }, { latency: 47, name: "sample.bal/(25:34,25:68)", tps: 7.28 }] },
        { concurrency: "25", values: [{ latency: 800, name: "sample.bal/(22:33,22:67)", tps: 10.42 }, { latency: 800, name: "sample.bal/(24:34,24:68)", tps: 10.42 }, { latency: 800, name: "sample.bal/(25:34,25:68)", tps: 10.42 }] },
        { concurrency: "50", values: [{ latency: 1455, name: "sample.bal/(22:33,22:67)", tps: 11.45 }, { latency: 1455, name: "sample.bal/(24:34,24:68)", tps: 11.45 }, { latency: 1455, name: "sample.bal/(25:34,25:68)", tps: 11.45 }] },
        { concurrency: "75", values: [{ latency: 2213, name: "sample.bal/(22:33,22:67)", tps: 11.3 }, { latency: 2213, name: "sample.bal/(24:34,24:68)", tps: 11.3 }, { latency: 2213, name: "sample.bal/(25:34,25:68)", tps: 11.3 }] },
        { concurrency: "100", values: [{ latency: 3071, name: "sample.bal/(22:33,22:67)", tps: 10.85 }, { latency: 3071, name: "sample.bal/(24:34,24:68)", tps: 10.85 }, { latency: 3071, name: "sample.bal/(25:34,25:68)", tps: 10.85 }] }
      ],
      message: undefined,
      type: undefined
    });
  }
}
