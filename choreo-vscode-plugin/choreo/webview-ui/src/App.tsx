import styled from "@emotion/styled";
import { ChoreoWebViewContext } from "./context/choreo-web-view-ctx";
import { usePopulateContext } from "./hooks/context-populate";
import { ProjectWizard } from "./ProjectWizard/ProjectWizard";

export const Main = styled.main`
  display: flex;
  flex-direction: row;
  justify-content: center;
  padding: 20px;
  height: 100vh;
`;

function App() {

  const contextVal = usePopulateContext();

  return (
    <Main>
      <ChoreoWebViewContext.Provider value={contextVal}>
        <ProjectWizard />
      </ChoreoWebViewContext.Provider>
    </Main>
  );
}

export default App;
