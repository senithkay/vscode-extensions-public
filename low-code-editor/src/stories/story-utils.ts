import { BalleriaLanguageClient, WSConnection } from "@wso2-enterprise/ballerina-languageclient";

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
