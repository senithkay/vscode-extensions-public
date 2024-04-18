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
import { VisualizerLocation, CreateProjectRequest, GetWorkspaceContextResponse } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import {TextArea, Button, Switch, Icon, ProgressRing} from "@wso2-enterprise/ui-toolkit";
import ReactMarkdown from 'react-markdown';
import './AIProjectGenerationChat.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { MI_ARTIFACT_EDIT_BACKEND_URL, MI_ARTIFACT_GENERATION_BACKEND_URL, MI_SUGGESTIVE_QUESTIONS_BACKEND_URL } from "../../constants";
import { Collapse } from 'react-collapse';
import { AI_MACHINE_VIEW } from '@wso2-enterprise/mi-core';

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
import { set } from "lodash";


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
var backendRootUri = "";

export function AIProjectGenerationChat() {
  const { rpcClient } = useVisualizerContext();
  const [state, setState] = useState<VisualizerLocation | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string; type:string }>>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  const [lastQuestionIndex, setLastQuestionIndex] = useState(-1);
  const messagesEndRef = React.createRef<HTMLDivElement>();
  const [isOpen, setIsOpen] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isCodeLoading, setIsCodeLoading] = useState(false);

     async function fetchBackendUrl() {
          try {
              backendRootUri = (await rpcClient.getMiDiagramRpcClient().getBackendRootUrl()).url;
              // Do something with backendRootUri
          } catch (error) {
              console.error('Failed to fetch backend URL:', error);
          }
      }
    useEffect(() => {

        fetchBackendUrl();

      }, []); 

      useEffect(() => {
        rpcClient?.getMiDiagramRpcClient().getProjectUuid().then((response) => {
          projectUuid = response.uuid;
          const localStorageFile = `chatArray-AIGenerationChat-${projectUuid}`;
          const localStorageQuestionFile = `Question-AIGenerationChat-${projectUuid}`;
          const storedChatArray = localStorage.getItem(localStorageFile);
          const storedQuestion = localStorage.getItem(localStorageQuestionFile);
          const storedCodeBlocks = localStorage.getItem(`codeBlocks-AIGenerationChat-${projectUuid}`);
          rpcClient.getAIVisualizerState().then((machineView) => { 
            if(machineView.initialPrompt){
              setMessages(prevMessages => [
                ...prevMessages,
                { role: "User", content: machineView.initialPrompt, type: "initial_prompt" },
              ]);
              addChatEntry("user", machineView.initialPrompt);
              handleSend(false);
              rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.clearAIPrompt"] });
            } else {
              if (storedChatArray) {
                if(storedQuestion){
                  setMessages(prevMessages => [
                    ...prevMessages,
                    { role: "", content: storedQuestion, type: "question" },
                  ]);
                }
                if(storedCodeBlocks){
                  const codeBlocksFromStorage = JSON.parse(storedCodeBlocks);
                  codeBlocks.push(...codeBlocksFromStorage);
                }
                console.log("Code Blocks: " + codeBlocks);
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
                    // { role: "" , content: "Generate a Sample Hello World API", type: "question"},
                    // { role: "" , content: "Generate a JSON to XML Integration Scenario", type: "question"},
                    // { role: "" , content: "Generate a Message Routing Integration for a Hospital System", type: "question"}
                  ]);
                  if(storedQuestion){
                    setMessages(prevMessages => [
                      ...prevMessages,
                      { role: "", content: storedQuestion, type: "question" },
                    ]);
                  } else {
                    console.log("Fetching initial questions");
                    generateSuggestions();
                  }
                }
              }
            }
          });
        });
      }, []);

  function addChatEntry(role: string, content: string): void {
      chatArray.push({
        role,
        content,
      });

      localStorage.setItem(`chatArray-AIGenerationChat-${projectUuid}`, JSON.stringify(chatArray));
      
  }

  useEffect(() => {
  // This code will run after isCodeLoading updates
  console.log(isCodeLoading);
}, [isCodeLoading]); // The dependency array ensures this effect runs whenever isCodeLoading changes

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
    try {
        setIsLoading(true);
        setIsSuggestionLoading(true); // Set loading state to true at the start
        const url = backendRootUri + MI_SUGGESTIVE_QUESTIONS_BACKEND_URL;
        var context: GetWorkspaceContextResponse[] = [];
        //Get machine view
        const machineView = await rpcClient.getAIVisualizerState();
        switch (machineView?.view) {
            case AI_MACHINE_VIEW.AIOverview:
                await rpcClient?.getMiDiagramRpcClient()?.getWorkspaceContext().then((response) => {
                    context = [response]; // Wrap the response in an array
                 });
                break;
            case AI_MACHINE_VIEW.AIArtifact:
                await rpcClient?.getMiDiagramRpcClient()?.getSelectiveWorkspaceContext().then((response) => {
                  context = [response]; // Wrap the response in an array
                });
                break;
            default:
              await rpcClient?.getMiDiagramRpcClient()?.getWorkspaceContext().then((response) => {
                  context = [response]; // Wrap the response in an array
               });
                console.log("default");  
        }
        console.log(JSON.stringify({messages: chatArray, context : context[0].context}));
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({messages: chatArray, context : context[0].context, num_suggestions:1, type: "artifact_gen" }),
        });
        if (!response.ok) {
            throw new Error("Failed to fetch initial questions");
        }
        const data = await response.json() as ApiResponse;
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
    } catch (error) {
        console.error(error);
        setIsLoading(false);
        setIsSuggestionLoading(false);
    } finally {
        setIsLoading(false);
        setIsSuggestionLoading(false); // Set loading state to false after fetch is successful or if an error occurs
    }
}


  async function handleSend (isQuestion: boolean = false) {
    console.log(chatArray);
    var context: GetWorkspaceContextResponse[] = [];
    setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'label'));
    setMessages(prevMessages => prevMessages.filter((message, index) => message.type !== 'question'));

    setIsLoading(true);
    let assistant_response = "";
    if(!isQuestion){
      addChatEntry("user", userInput);
    }
    setUserInput("");
    setMessages(prevMessages => prevMessages.filter((message, index) => index <= lastQuestionIndex || message.type !== 'question'));
    if(isQuestion){
          setLastQuestionIndex(messages.length-4);
          setMessages(prevMessages => [
                ...prevMessages,
                { role: "MI Copilot", content: "", type:"assistant_message"}, // Add a new message for the assistant
          ]);
    }else{
      if(userInput!=""){
          setMessages(prevMessages => [
            ...prevMessages,
            { role: "User", content: userInput, type: "user_message"},
            { role: "MI Copilot", content: "", type:"assistant_message"}, // Add a new message for the assistant
      ]);
      }else{
        setMessages(prevMessages => [
          ...prevMessages,
          { role: "MI Copilot", content: "", type:"assistant_message"}, // Add a new message for the assistant
    ]);
      }
       
    }
    var backendUrl = ""
    var view = ""
    //Get machine view
    const machineView = await rpcClient.getAIVisualizerState();
      switch (machineView?.view) {
          case AI_MACHINE_VIEW.AIOverview:
              backendUrl = MI_ARTIFACT_GENERATION_BACKEND_URL;
              view = "Overview";
              break;
          case AI_MACHINE_VIEW.AIArtifact:
              backendUrl = MI_ARTIFACT_EDIT_BACKEND_URL;
              view = "Artifact";
              break;
          default:
            backendUrl = MI_ARTIFACT_GENERATION_BACKEND_URL;
            view = "Overview";
            console.log("default");
              
      }
      if(view == "Overview"){
            await rpcClient?.getMiDiagramRpcClient()?.getWorkspaceContext().then((response) => {
              context = [response]; // Wrap the response in an array
            } );
      }else if(view == "Artifact"){
            await rpcClient?.getMiDiagramRpcClient()?.getSelectiveWorkspaceContext().then((response) => {
              context = [response]; // Wrap the response in an array
            } );
      }
      console.log(context[0].context);
    const response = await fetch(backendRootUri+backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({messages: chatArray, context : context[0].context}),
    })
    if (!response.ok) {
      setIsLoading(false);
      throw new Error('Failed to fetch response');
    }
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let codeBuffer = '';
    let codeLoad = false;
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
                    if(json.content.includes("``")){
                        setIsCodeLoading(prevIsCodeLoading => !prevIsCodeLoading);
                    }
                       
                    setMessages(prevMessages => {
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1].content += json.content;
                        return newMessages;
                    });

                  const regex = /```[\s\S]*?```/g;
                  let match;
                  while ((match = regex.exec(assistant_response)) !== null) {
                    if (!codeBlocks.includes(match[0])) {
                      codeBlocks.push(match[0]);
                    }
                  }
            }
          } catch (error) {
            setIsLoading(false);
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
      localStorage.setItem(`codeBlocks-AIGenerationChat-${projectUuid}`, JSON.stringify(codeBlocks));

  };


  const handleAddtoWorkspace = async () => {

       await rpcClient.getMiDiagramRpcClient().writeContentToFile({content: codeBlocks}).then((response) => {
          console.log(response);
        } );

        rpcClient.getMiDiagramRpcClient().executeCommand({ commands: ["MI.project-explorer.refresh"] });

        //clear code blocks array and the chat array
        // codeBlocks.length = 0;
        // chatArray.length = 0;

        // setMessages((prevMessages) => [
        //   { role: "", content: "Welcome to the AI Powered Generation and Editing Tool. You may use this tool to generate entirely new Artifacts or to do changes to existing artifacts simply using text based prompts. The context of your generation shall always be the window you have currenly opened.", type: "label" },
        //   { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
        //   { role: "" , content: "Generate a Sample Hello World API", type: "question"},
        //   { role: "" , content: "Generate a JSON to XML Integration Scenario", type: "question"},
        //   { role: "" , content: "Generate a Message Routing Integration for a Hospital System", type: "question"}
        // ]);

        //clear the local storage
        // localStorage.removeItem(`chatArray-AIGenerationChat-${projectUuid}`);
        // localStorage.removeItem(`Question-AIGenerationChat-${projectUuid}`);
  }

  const handleAddSelectiveCodetoWorkspace = async (codeSegment: string) => {

      var selectiveCodeBlocks: string[] = [];
      selectiveCodeBlocks.push(codeSegment);
      await rpcClient.getMiDiagramRpcClient().writeContentToFile({content: selectiveCodeBlocks}).then((response) => {
         console.log(response);
       } );

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
      { role: "", content: "Welcome to the AI Powered Generation and Editing Tool. You may use this tool to generate entirely new Artifacts or to do changes to existing artifacts simply using text based prompts. The context of your generation shall always be the window you have currenly opened.", type: "label" },
      { role: "", content: "Given below are some sample questions you may ask. I am powered by AI, therefore mistakes and surprises are inevitable.", type: "label" },
      // { role: "" , content: "Generate a Sample Hello World API", type: "question"},
      // { role: "" , content: "Generate a JSON to XML Integration Scenario", type: "question"},
      // { role: "" , content: "Generate a Message Routing Integration for a Hospital System", type: "question"}
    ]);

    generateSuggestions();

    //clear the local storage
    localStorage.removeItem(`chatArray-AIGenerationChat-${projectUuid}`);
    localStorage.removeItem(`Question-AIGenerationChat-${projectUuid}`);
    
  }

  const questionMessages = messages.filter(message => message.type === "question");
  if(questionMessages.length > 0){
    localStorage.setItem(`Question-AIGenerationChat-${projectUuid}`, questionMessages[questionMessages.length-1].content);
  }
  const otherMessages = messages.filter(message => message.type !== "question");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "90%", width: "100%", margin: "auto" }}>
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
            
              <div>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between'}}>
                  <div onClick={() => setIsOpen(!isOpen)}>
                    <a style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <Icon name={isOpen ? 'arrow-down-solid' : 'arrow-right-solid'} />
                      <span style={{ fontStyle: 'italic' }}>{isOpen ? 'Hide Code' : 'Show Code'}</span>
                    </a>
                  </div>
                  <div onClick={() => handleAddSelectiveCodetoWorkspace(segment.text)}>
                    <a style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <Icon name='plus-solid' />
                      <span style={{ fontStyle: 'italic' }}>Add to Project</span>
                    </a>
                  </div>
                </div>
                <Collapse isOpened={isOpen}>
                  <SyntaxHighlighter key={i} language="xml" style={materialOceanic}>
                    {segment.text}
                  </SyntaxHighlighter>
                </Collapse>
              </div>
            
          ) : (
            
            <MarkdownRenderer key={i} markdownContent={segment.text} />
          
          )
        )}

        </div>
      ))}
      {/* {isCodeLoading && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          Generating Code &nbsp;&nbsp; <ProgressRing sx={{position: "relative"}}/>
        </div>
      )} */}
       <div ref={messagesEndRef} />
      </div>

        <div style={{ paddingTop: "15px", marginLeft: "10px" }}>
        {isLoading && (
                <div>
                  {/* Other content when isLoading is true */}
                  {isSuggestionLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Generating suggestions for you... &nbsp;&nbsp; <ProgressRing sx={{position: "relative"}}/>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%"}}>
                      <ProgressRing sx={{position: "relative"}}/>
                    </div>
                  )}
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

      {/* {isLoading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "4%"}}>
                  <ProgressRing sx={{position: "relative"}}/>
            </div>
        ): null} */}

      <div style={{ display: "flex", flexDirection: "column", padding: "10px" }}>
        <TextArea
          onTextChange={(e) => setUserInput(e)}
          placeholder="Type your message here"
          required={true}
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
              <div style={{ color: 'var(--vscode-button-foreground)' }}>Send</div>
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
                    <div style={{ color: 'var(--vscode-button-foreground)' }}>Add all to Workspace</div>
                  </Button>
          </div>
      </div>
    </div>
  );
}
