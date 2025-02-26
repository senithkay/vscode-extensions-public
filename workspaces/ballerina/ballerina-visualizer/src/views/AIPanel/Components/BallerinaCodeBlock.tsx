import React, { useState } from 'react';
import styled from '@emotion/styled';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Codicon } from '@wso2-enterprise/ui-toolkit';

const CodeBlockContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--vscode-list-hoverBackground);
  padding: 8px 16px;
  color: var(--vscode-editor-foreground);
`;

const Title = styled.div`
  font-weight: bold;
`;

const CopyButton = styled.button<{ copied: boolean }>`
  background: ${({ copied }: { copied: boolean }) => (copied ? 'var(--vscode-badge-background)' : 'transparent')};
  border: none;
  color: var(--vscode-editor-foreground);
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s ease;
`;

interface BallerinaCodeBlockProps {
  code: string;
}

const BallerinaCodeBlock: React.FC<BallerinaCodeBlockProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code: ', err);
    }
  };

  return (
    <CodeBlockContainer>
      <Header>
        <Title>Ballerina</Title>
        <CopyButton onClick={handleCopy} copied={copied} title="Copy code">
          <Codicon name="copy" />
        </CopyButton>
      </Header>
      <SyntaxHighlighter
        language="ballerina"
        style={darcula}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          backgroundColor: 'var(--vscode-editorWidget-background)',
          padding: '8px 16px'
        }}
        codeTagProps={{
          style: {
            backgroundColor: 'transparent',
            color: 'var(--vscode-editor-foreground)',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </CodeBlockContainer>
  );
};

export default BallerinaCodeBlock;
