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
import {TextArea, Button, Switch} from "@wso2-enterprise/ui-toolkit";
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaMagic } from "react-icons/fa";


interface MarkdownRendererProps {
  markdownContent: string;
}

interface ChatEntry {
  role: string;
  content: string;
}

var chatArray: ChatEntry[] = [];

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

// A string array to store all code blocks
const codeBlocks: string[] = [];
var projectUuid = "";

export function AIProjectGenerationChat() {
  const { rpcClient } = useVisualizerContext();
  const [state, setState] = useState<VisualizerLocation | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; type:string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
  const messagesEndRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    rpcClient.getMiDiagramRpcClient().getProjectUuid().then((response) => {
      projectUuid = response.uuid;
      console.log("Project UUID: " + projectUuid);
      const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
    console.log("Local Storage File: " + localStorageFile);
    const storedChatArray = localStorage.getItem(localStorageFile);
    if (storedChatArray) {
      console.log("Stored Chat: " + storedChatArray);
      const chatArrayFromStorage = JSON.parse(storedChatArray);
  
      chatArray = chatArrayFromStorage;
  
      // Add the messages from the chat array to the view
      setMessages((prevMessages) => [
        ...prevMessages,
        ...chatArray.map((entry: ChatEntry) => {
          let role, type;
          if (entry.role === 'user') {
            role = 'User';
            type = 'user_message';
          } else if (entry.role === 'assistant') {
            role = 'MI Copilot';
            type = 'assistant_message';
          }
          return {
            role: role,
            type: type,
            content: entry.content,
          };
        }),
      ]);
  
      // Set initial messages only if chatArray's length is 0

    } else {
      if (chatArray.length === 0) {
        setMessages((prevMessages) => [
          ...prevMessages,
      { role: "", content: "Welcome to the AI Powered Generation and Editing Tool. You may use this tool to generate entirely new Artifacts or to do changes to existing artifacts simply using text based prompts. The context of your generation shall always be the window you have currenly opened.", type: "label" },
      { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
      { role: "" , content: "Generate a Sample Hello World API", type: "question"},
      { role: "" , content: "Generate a JSON to XML Integration Scenario", type: "question"},
      { role: "" , content: "Generate a Message Routing Integration for a Hospital System", type: "question"}
        ]);
      }
      console.log("No stored chat");
    }
    } );
    
  }, []);


  function addChatEntry(role: string, content: string): void {
      chatArray.push({
        role,
        content,
      });

      localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));
      
  }


  useEffect(() => {
    // Step 2: Scroll into view when messages state changes
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (rpcClient) {
      rpcClient.getVisualizerState().then((initialState) => {
        setState(initialState);
      });
    }
  }, [rpcClient]);

  async function handleSend (isQuestion: boolean = false) {
    setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'label'));
    setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'question'));
    await rpcClient.getMiDiagramRpcClient().getWorkspaceContext().then((response) => {
      console.log(response);
    } );

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

    const response = await fetch('http://127.0.0.1:8000/code-gen-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({messages: chatArray}),
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
            if(json.content==null){
                  console.log("Question Found");
                  addChatEntry("assistant", assistant_response);
                  console.log(json.questions);
                  const questions = json.questions
                    // .filter((question: string) => /^\d/.test(question)) // filter out questions that start with a number
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

       await rpcClient.getMiDiagramRpcClient().writeContentToFile({content: codeBlocks}).then((response) => {
          console.log(response);
        } );

        //clear code blocks array and the chat array
        codeBlocks.length = 0;
        chatArray.length = 0;

        setMessages((prevMessages) => [
          { role: "", content: "Welcome to the AI Powered Generation and Editing Tool. You may use this tool to generate entirely new Artifacts or to do changes to existing artifacts simply using text based prompts. The context of your generation shall always be the window you have currenly opened.", type: "label" },
          { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
          { role: "" , content: "Generate a Sample Hello World API", type: "question"},
          { role: "" , content: "Generate a JSON to XML Integration Scenario", type: "question"},
          { role: "" , content: "Generate a Message Routing Integration for a Hospital System", type: "question"}
        ]);

        //clear the local storage
        localStorage.removeItem(`chatArray-AIGenerationChat-${projectUuid}`);




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

  function handleClearChat(): void {
    codeBlocks.length = 0;
    chatArray.length = 0;

    setMessages((prevMessages) => [
      { role: "", content: "Welcome to MI Copilot Chat! I am here to assist you with WSO2 Micro Integrator. You can ask me to explain about WSO2 Integrations, get help on coding or development.", type: "label" },
      { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
      { role: "", content: "Explain me about this Artifact", type: "question" },
      { role: "", content: "What are the possible use cases in using WSO2 Micro Integrator?", type: "question" },
      { role: "", content: "How to use the File Connector?", type: "question" }
    ]);

    //clear the local storage
    localStorage.removeItem(`chatArray-AIChat-${projectUuid}`);
    
  }

  const questionMessages = messages.filter(message => message.type === "question");
  const otherMessages = messages.filter(message => message.type !== "question");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "90%", width: "100%", margin: "auto" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px", borderBottom: "1px solid #ccc" }}>
      <FontAwesomeIcon
            icon={faTrash}
            size="lg"
            style={{ cursor: "pointer", color: "white" }}
            onClick={() => handleClearChat()}
          />
       {otherMessages.map((message, index) => (
        <div key={index} style={{ marginBottom: "8px" }}>
        {message.type !== "question" && message.type !== "label" && <strong>{message.role}:</strong>}
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

       <div ref={messagesEndRef} />
      </div>

      <div style={{ paddingTop: "15px", marginLeft: "10px" }}>
          {questionMessages.map((message, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuestionClick(message.content);
                }}
                style={{ color: 'lightblue', textDecoration: 'underline' }}
              >
                <FaMagic style={{ marginRight: '5px' }} />
                {message.content.replace(/^\d+\.\s/, "")}
              </a>
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
                    <div style={{ color: 'var(--vscode-editor-foreground)' }}>Add all to Workspace</div>
                  </Button>
          </div>
      </div>
    </div>
  );
}
