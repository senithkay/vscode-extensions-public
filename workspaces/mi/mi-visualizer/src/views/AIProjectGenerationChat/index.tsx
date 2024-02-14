import React, { useEffect, useState } from "react";
import { VisualizerLocation, CreateProjectRequest } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import {TextArea, Button} from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import './AIProjectGenerationChat.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { MI_COPILOT_BACKEND_URL } from "../../constants";

import {
  materialDark,
  materialLight,
  oneLight,
  okaidia,
  tomorrow,
  twilight,
  coy,
  funky,
  dark,
  dracula,
  materialOceanic,
} from 'react-syntax-highlighter/dist/cjs/styles/prism'


interface MarkdownRendererProps {
  markdownContent: string;
}

interface ChatEntry {
  role: string;
  content: string;
}

const chatArray: ChatEntry[] = [];

function addChatEntry(role: string, content: string): void {
  chatArray.push({
    role,
    content,
  });
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

// A string array to store all code blocks
const codeBlocks: string[] = [];

export function AIProjectGenerationChat() {
  const { rpcClient } = useVisualizerContext();
  const [state, setState] = useState<VisualizerLocation | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    if (rpcClient) {
      rpcClient.getVisualizerState().then((initialState) => {
        setState(initialState);
      });
    }
  }, [rpcClient]);

  const handleSend = () => {
    addChatEntry("user", userInput);
    setUserInput("");
    console.log(chatArray);

    fetch(MI_COPILOT_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chat_history: chatArray }),
    })
      .then(response => response.body)
      .then(body => {
        const reader = body.getReader();

        setMessages(prevMessages => [
          ...prevMessages,
          { role: "User", content: userInput },
        ]);

        const processStream = async () => {
          let result = await reader.read();

          setMessages(prevMessages => [
            ...prevMessages,
            { role: "MI Copilot", content: " " },
          ]);

          var assistant_response = ""
          while (!result.done) {
            const data = new TextDecoder("utf-8").decode(result.value);

            setMessages(prevMessages => {
              const newMessages = [...prevMessages];
              newMessages[newMessages.length - 1].content += data;
              return newMessages;
            });

            result = await reader.read();

            assistant_response += data;
          }

          // Add code blocks to codeBlocks array
          const regex = /```[\s\S]*?```/g;
          let match;
          while ((match = regex.exec(assistant_response)) !== null) {
            codeBlocks.push(match[0]);
          }

          addChatEntry("assistant", assistant_response);
        };

        processStream().catch(console.error);
      })
      .catch(error => {
        console.error('Error:', error);
      });

  
  };


  const handleAddtoWorkspace = async () => {
      console.log(codeBlocks);
      var path="";
      await rpcClient.getMiDiagramRpcClient().askProjectDirPath().then((response) => {
        path = response.path;
        const request: CreateProjectRequest = {
          directory: path,
          name: "temp",
          open: false,
        };
  
        rpcClient.getMiDiagramRpcClient().createProject(request).then((response) => {
          console.log(response);
        } );

        rpcClient.getMiDiagramRpcClient().writeContentToFile({content: codeBlocks, directoryPath: path}).then((response) => {
          console.log(response);
        } );
      });
  }


  function splitContent(content: string) {
    const segments = [];
    let match;
    const regex = /```xml([\s\S]*?)```/g;
    let start = 0;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > start) {
        segments.push({ isCode: false, text: content.slice(start, match.index) });
      }
      segments.push({ isCode: true, text: match[1] });
      start = regex.lastIndex;
    }
    if (start < content.length) {
      segments.push({ isCode: false, text: content.slice(start) });
    }
    return segments;
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", margin: "auto" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px", borderBottom: "1px solid #ccc" }}>
        {messages.map((message, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            <strong>{message.role}:</strong>
            {splitContent(message.content).map((segment, i) =>
                segment.isCode ? (
                  <SyntaxHighlighter key={i} language="xml" style={materialOceanic}>
                    {segment.text}
                  </SyntaxHighlighter>
                ) : (
                  <MarkdownRenderer key={i} markdownContent={segment.text} />
                )
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
        <TextArea
          onChange={(e) => setUserInput(e)}
          placeholder="Type your message here"
          required
          value={userInput}
          className="custom-textarea-style"
        />
        <Button

          appearance="primary"
          onClick={handleSend}
          tooltip="Send"
          className="custom-button-style"
        >
          
          <br />
          <div style={{ color: 'var(--vscode-editor-foreground)' }}>Send</div>
        </Button>
       
        <Button
          appearance="primary"
          onClick={handleAddtoWorkspace}
          tooltip="Send"
          className="custom-button-style"
        >
          
          <div style={{ color: 'var(--vscode-editor-foreground)' }}>Create Project</div>
        </Button>
      </div>
    </div>
  );
}
