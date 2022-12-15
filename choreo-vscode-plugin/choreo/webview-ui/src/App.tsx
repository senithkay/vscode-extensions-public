import { vscode } from "./utilities/vscode";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "@emotion/styled";

export const Main = styled.main`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 100%;
  & > * {
    margin: 1rem 0;
  }
`;


function App() {
  function handleHowdyClick() {
    vscode.postMessage({
      command: "hello",
      text: "Hey there partner! 🤠",
    });
  }

  return (
    <Main>
      <h1>Hello World!</h1>
      <VSCodeButton onClick={handleHowdyClick}>Howdy!</VSCodeButton>
    </Main>
  );
}

export default App;
