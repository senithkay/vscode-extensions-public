/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import React, { useEffect, useState } from "react";
import { VisualizerLocation, CreateProjectRequest } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import {TextArea, Button} from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import './AIProjectGenerationChat.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { BeatLoader } from "react-spinners";
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
  const [messages, setMessages] = useState<Array<{ role: string; content: string; type:string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);

  useEffect(() => {
    if (rpcClient) {
      rpcClient.getVisualizerState().then((initialState) => {
        setState(initialState);
      });
    }
  }, [rpcClient]);

  async function handleSend (isQuestion: boolean = false) {
    console.log(isQuestion);
    setIsLoading(true);
    let assistant_response = "";
    addChatEntry("user", userInput);
    setUserInput("");
    console.log(chatArray);
    setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
    if(isQuestion){
          setLastQuestionIndex(messages.length-4);
          setMessages(prevMessages => [
                ...prevMessages,
                { role: "MI Copilot", content: "", type:"assistant_message"}, // Add a new message for the assistant
          ]);
    }else{
        setMessages(prevMessages => [
            ...prevMessages,
            { role: "User", content: userInput, type: "user_message"},
            { role: "MI Copilot", content: "", type:"assistant_message"}, // Add a new message for the assistant
        ]);
    }

    const response = await fetch('http://localhost:8000/generate-synapse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({chat_history: chatArray}),
    })
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done){
          setIsLoading(false);
          break;
        } 

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
    
        const lines = result.split('\n');
        for (let i = 0; i < lines.length - 1; i++) {
          try {
            const json = JSON.parse(lines[i]);
            if(json.content==''){
                  addChatEntry("assistant", assistant_response);
                  console.log(json.questions);
                  const questions = json.questions
                    .filter((question: string) => /^\d/.test(question)) // filter out questions that start with a number
                    .map((question: string, index: number) => {
                      return { type: "question", role: "Question", content: question, id: index };
                    });

                  setMessages(prevMessages => [
                    ...prevMessages,
                    ...questions,
                  ]);
            }else{
                    assistant_response += json.content;
                    setMessages(prevMessages => {
                      const newMessages = [...prevMessages];
                      newMessages[newMessages.length - 1].content += json.content;
                      return newMessages;
                    });
                  const regex = /```[\s\S]*?```/g;
                  let match;
                  while ((match = regex.exec(assistant_response)) !== null) {
                    codeBlocks.push(match[0]);
                  }
            }
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
        result = lines[lines.length - 1];
        
    }
  
  
    
      if (result) {
          try {
            const json = JSON.parse(result);
            console.log(json); 
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
  };


  const handleAddtoWorkspace = async () => {
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

  function handleQuestionClick(content: string) {
    const question = content;

    //remove numbering from question and take only the text of it
    const questionText = question.replace(/^\d+\.\s/, "");
    setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
    setLastQuestionIndex(messages.length);

    if (questionText) {
      addChatEntry("user", questionText);
  
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "User", content: questionText, type: "user_message" },
      ]);
  
      handleSend(true);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "95%", width: "100%", margin: "auto" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px", borderBottom: "1px solid #ccc" }}>
       {messages.map((message, index) => (
        <div key={index} style={{ marginBottom: "8px" }}>
        {message.type !== "question" && <strong>{message.role}:</strong>}
          {message.type === "question" && index > lastQuestionIndex ? (
            <Button
              appearance="primary"
              onClick={() => handleQuestionClick(message.content)}
              tooltip="Click to answer this question"
              className="custom-button-style"
            >
                <div style={{ color: 'var(--vscode-editor-foreground)' }}>
                    {message.content.replace(/^\d+\.\s/, "")}
                </div>
            </Button>
          ) : splitContent(message.content).map((segment, i) =>
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
      {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%"}}>
                  <BeatLoader color="#4A90E2" />
            </div>
        ): null}

      <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
        <TextArea
          onChange={(e) => setUserInput(e)}
          placeholder="Type your message here"
          required
          value={userInput}
          className="custom-textarea-style"
        />
        <div>
            <Button
              appearance="primary"
              onClick={() => handleSend(false)}
              tooltip="Send"
              className="custom-button-style"
              disabled={isLoading}
            >
              <br />
              <div style={{ color: 'var(--vscode-editor-foreground)' }}>Send</div>
            </Button>
        </div>

        <div>
            <Button
              appearance="primary"
              onClick={handleAddtoWorkspace}
              tooltip="Send"
              className="custom-button-style"
              disabled={isLoading}
            >
              <br />
              <div style={{ color: 'var(--vscode-editor-foreground)' }}>Create Project</div>
            </Button>
        </div>



      </div>
    </div>
  );
}
