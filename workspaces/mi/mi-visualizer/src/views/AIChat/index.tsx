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
import {TextArea, Button, Switch, Icon, ProgressRing} from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import './AIChat.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { MI_COPILOT_BACKEND_URL, MI_SUGGESTIVE_QUESTIONS_INITIAL_BACKEND_URL } from "../../constants";

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

var chatArray: ChatEntry[] = [];


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ markdownContent }) => {
  return <ReactMarkdown>{markdownContent}</ReactMarkdown>;
};

// A string array to store all code blocks
const codeBlocks: string[] = [];
var projectUuid = "";

export function AIChat() {
  const { rpcClient } = useVisualizerContext();
  const [state, setState] = useState<VisualizerLocation | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; type: string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const messagesEndRef = React.createRef<HTMLDivElement>();

  useEffect(() => {
    rpcClient.getMiDiagramRpcClient().getProjectUuid().then((response) => {
      projectUuid = response.uuid;
      const localStorageChatFile = `chatArray-AIChat-${projectUuid}`;
      const localStorageQuestionFile = `Question-AIChat-${projectUuid}`;
    const storedChatArray = localStorage.getItem(localStorageChatFile);
    if (storedChatArray) {
      const storedQuestion = localStorage.getItem(localStorageQuestionFile);
      if(storedQuestion){
        setMessages(prevMessages => [
          ...prevMessages,
          { role: "", content: storedQuestion, type: "question" },
        ]);
      }
      
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
          { role: "", content: "Welcome to MI Copilot Chat! I am here to assist you with WSO2 Micro Integrator. You can ask me to explain about WSO2 Integrations, get help on coding or development.", type: "label" },
          { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
          // { role: "", content: "Explain me about this Artifact", type: "question" },
          // { role: "", content: "What are the possible use cases in using WSO2 Micro Integrator?", type: "question" },
          // { role: "", content: "How to use the File Connector?", type: "question" }
        ]);
        if(chatArray.length === 0){
          console.log("Fetching initial questions");
          generateSuggestions();
        }
      }
    }
    } );
    
  }, []);


  function addChatEntry(role: string, content: string): void {
      chatArray.push({
        role,
        content,
      });

      localStorage.setItem(`chatArray-AIChat-${projectUuid}`, JSON.stringify(chatArray));
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

  interface ApiResponse {
    event: string;
    error: string | null;
    questions: string[];
  }


  useEffect(() => {
    console.log("Suggestions: " + isSuggestionLoading);
  } , [isSuggestionLoading]);

  async function generateSuggestions() {
    setIsSuggestionLoading(true); // Set loading state to true at the start
    const url = MI_SUGGESTIVE_QUESTIONS_INITIAL_BACKEND_URL + "?num_suggestions=2&q_type=copilot_chat";
    fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to fetch initial questions");
          }
        return response.json() as Promise<ApiResponse>;
        })
        .then(data => {
          if (data.event === "suggestion_generation_success") {
            // Extract questions from the response
            const initialQuestions = data.questions.map(question => ({
              role: "",
              content: question,
              type: "question"
            }));
            // Update the state with the fetched questions
            setMessages(prevMessages => [...prevMessages, ...initialQuestions]);
          } else {
            throw new Error("Failed to generate suggestions: " + data.error);
          }
          setIsSuggestionLoading(false); // Set loading state to false after fetch is successful
        })
        .catch(error => {
          console.error("Error fetching initial questions:", error);
          setIsSuggestionLoading(false); // Set loading state to false even if there's an error
        });
   }

  async function handleSend (isQuestion: boolean = false) {
    if (messages[0].type === "label" && messages[1].type === "label") {
      setMessages(prevMessages => prevMessages.slice(2));
    }
    await rpcClient.getMiDiagramRpcClient().getWorkspaceContext().then((response) => {
    } );
    setIsLoading(true);
    let assistant_response = "";
    addChatEntry("user", userInput);
    setUserInput("");
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

    const response = await fetch(MI_COPILOT_BACKEND_URL, {
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
                  addChatEntry("assistant", assistant_response);
                  const questions = json.questions
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
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
  };

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
    ]);

    generateSuggestions();

    //clear the local storage
    localStorage.removeItem(`chatArray-AIChat-${projectUuid}`);
    localStorage.removeItem(`Question-AIChat-${projectUuid}`);
    
  }

  const questionMessages = messages.filter(message => message.type === "question");
  if(questionMessages.length > 0){
    localStorage.setItem(`Question-AIChat-${projectUuid}`, questionMessages[questionMessages.length-1].content);
  }
  const otherMessages = messages.filter(message => message.type !== "question");
  return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", margin: "auto" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px", borderBottom: "1px solid #ccc" }}>
      <div style={{ textAlign: "right" }}>
          <Icon
            name="trash-solid"
            sx="width: 100%; height: 100%; cursor: pointer;"
            onClick={() => handleClearChat()}
          />
        </div>
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
          {isSuggestionLoading && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        Generating suggestions for you... &nbsp;&nbsp; <ProgressRing sx={{position: "relative"}}/>
                      </div>
          )}
          {questionMessages.map((message, index) => (
            <div key={index} style={{ marginBottom: "5px" }}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleQuestionClick(message.content);
                }}
                style={{ textDecoration: 'none' }}
              >   
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="wand-magic-sparkles-solid" sx="marginRight:5px"/>
                    {message.content.replace(/^\d+\.\s/, "")}
                </div>
              </a>
            </div>
          ))}
      </div>

      {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%"}}>
                  <ProgressRing sx={{position: "relative"}}/>
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
      </div>
    </div>
  );
}
