import { BalleriaLanguageClient, WSConnection } from "@wso2-enterprise/ballerina-languageclient";

import devproject from "./data/devproject.json";

export const MOCK_SERVER_URL = "http://localhost:3000"
export const LANG_SERVER_URL = "ws://localhost:9095"

export const langClientPromise = WSConnection.initialize(LANG_SERVER_URL).then((wsConnection: WSConnection) => {
  return new BalleriaLanguageClient(wsConnection);
});

export async function getFileContent(filePath: string): Promise<string> {

  return fetch(MOCK_SERVER_URL + "/file/" + encodeURIComponent(getProjectPath() + filePath))
    .then(response => {
      return response.text()
    })
}

export  function getFileURI(filePath: string): string {
  return getProjectPath() + filePath
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


function getProjectPath() {
  return devproject.projectPath;
}

export async function fetchSyntaxTree(filePath: string) {
  const text = await getFileContent(filePath);
  const langClient = await langClientPromise;
  const uri = `file://${filePath}`;

  await langClient.didOpen({
    textDocument: {
      languageId: "ballerina",
      text,
      uri,
      version: 1
    }
  });

  const syntaxTreeResponse = await langClient.getSyntaxTree({
    documentIdentifier: {
      uri
    }
  });

  const syntaxTree = syntaxTreeResponse.syntaxTree;

  langClient.didClose({
    textDocument: {
      uri,
    }
  });

  return syntaxTree;
}
