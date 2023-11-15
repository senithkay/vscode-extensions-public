import React, { useState } from 'react';
import { VSCodeTextField, VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';

const FormWrapper = styled.div({
  padding: "0px 20px 20px 20px"
});

function URLForm({ onURLSubmit: onURLSubmit, onClose: onClose }: { onURLSubmit: (url: string) => void, onClose: () => void }) {
  const [urlInput, setUrlInput] = useState('');

  const handleInputChange = (event: any) => {
    setUrlInput(event.target.value);
  };

  const handleSubmit = () => {
    onURLSubmit(urlInput);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <FormWrapper>
        <h3>Enter Service URL</h3>
        <p>Unable to detect service URL from OpenAPI Specification or provided URL is a template. Please specify the service URL to continue.</p>
        <VSCodeTextField
          value={urlInput}
          onInput={handleInputChange}
          placeholder="Enter URL ie. http://localhost:9090/basePath/"
          style={{ width: '100%', marginBottom: "10px" }}
        />
        <VSCodeButton onClick={handleSubmit}>Continue</VSCodeButton>
        <VSCodeButton onClick={handleClose} appearance={"secondary"} style={{ marginLeft: "10px" }}>Close</VSCodeButton>
      </FormWrapper>
    </>
  );
}

export default URLForm;

