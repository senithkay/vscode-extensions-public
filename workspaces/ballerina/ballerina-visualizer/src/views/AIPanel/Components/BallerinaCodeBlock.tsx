import React, { useState } from 'react';
import styled from '@emotion/styled';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark, darcula, monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaRegCopy } from 'react-icons/fa';

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
  background-color: #444;
  padding: 8px 16px;
  color: #fff;
`;

const Title = styled.div`
  font-weight: bold;
`;

const CopyButton = styled.button`
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: #bbb;
  }
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
        <CopyButton onClick={handleCopy} title="Copy code">
          <FaRegCopy />
        </CopyButton>
      </Header>
      <SyntaxHighlighter
        language="ballerina"
        style={darcula}
        customStyle={{
          margin: 0,
          borderRadius: 0, 
        }}
        codeTagProps={{
          style: {
        backgroundColor: 'transparent', 
        color: 'unset', 
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
      {copied && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 60,
            backgroundColor: '#50fa7b',
            color: '#282a36',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.85rem',
          }}
        >
          Copied!
        </div>
      )}
    </CodeBlockContainer>
  );
};

export default BallerinaCodeBlock;
