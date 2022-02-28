import { BalleriaLanguageClient, WSConnection } from "@wso2-enterprise/ballerina-languageclient";
import { LibraryDataResponse, LibraryDocResponse, LibraryKind, LibrarySearchResponse } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

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
