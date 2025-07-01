import React, { ReactNode, useState } from "react";
import { SlidingPaneContext, useSlidingPane } from "./context";
import styled from '@emotion/styled';
import { Codicon } from "../../../../Codicon/Codicon";
import { Divider } from "../../../../Divider/Divider";

const DEFAULT_SLIDING_WINDOW_HEIGHT = '200px';
const DEFAULT_SLIDING_WINDOW_WIDTH = 320;

type SlidingWindowProps = {
    children: React.ReactNode;
}

const SlidingWindowContainer = styled.div`
    display: flex;
    position: relative;
    overflow: hidden;
    width: 320px;
    height: 200px;
    padding: 8px;
    background-color: var(--vscode-dropdown-background);
    transition: height 0.3s ease-in-out, width 0.3s ease-in-out;
`;

export const SlidingWindow = ({children}:SlidingWindowProps) => {
    const [visitedPages, setVisitedPages] = useState<string[]>(["PAGE1"]);
    const [nextPage, setNextPage] = useState<string>();     
    const [prevPage, setPrevPage] = useState<string>();
    const [height, setHeight] = useState(DEFAULT_SLIDING_WINDOW_HEIGHT);
    const [width, setWidth] = useState(DEFAULT_SLIDING_WINDOW_WIDTH);

    const getCurrentPage = () => {
        if (visitedPages.length === 0) {
            //TODO: set a proper fall back
            return "PAGE1";
        }
        return visitedPages[visitedPages.length - 1];
    };  

    const moveToNext = (nextPage:string) => {
        setVisitedPages([...visitedPages, nextPage]);
    };

    const moveToPrev = () => {
        if (visitedPages.length > 1) {
            const visitedPagesCopy = [...visitedPages];
            visitedPagesCopy.pop();
            setVisitedPages(visitedPagesCopy);
        }
    };
    return (
        <SlidingPaneContext.Provider 
            value={{ 
                getCurrentPage: getCurrentPage,
                nextPage: nextPage, 
                prevPage: prevPage, 
                height: height,
                width: width,
                setWidth: setWidth,
                next: moveToNext, 
                prev: moveToPrev, 
                setNextPage: setNextPage, 
                setPrevPage: setPrevPage, 
                setHeight: setHeight,
                moveToNext: moveToNext,
                moveToPrev: moveToPrev,
            }}>
            <SlidingWindowContainer style={{ height: height, width: width }}>
                {children}
            </SlidingWindowContainer>
        </SlidingPaneContext.Provider>
    );
}

export const SlidingPaneContainer = styled.div<{ index: number; isCurrent?: boolean; width?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 320px;
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
  transform: ${({ index }: { index: number }) => `translateX(${index * 100}%)`};
`;

type SlidingPaneProps = { 
    name: string,
    paneHeight?: string,
    paneWidth?: number,
    nextView?: string,
    prevView?: string,
    children: React.ReactNode
}

export const SlidingPane = ({  children, name, paneHeight, paneWidth}:SlidingPaneProps) => {
    const { getCurrentPage, nextPage, prevPage,  setHeight, setWidth } = useSlidingPane();
    let index = 100;
    const currentPage = getCurrentPage();
    if (name === currentPage) {
        setHeight(paneHeight || DEFAULT_SLIDING_WINDOW_HEIGHT);
        setWidth(paneWidth || DEFAULT_SLIDING_WINDOW_WIDTH);
        index = 0
    }
    else if (name === nextPage) {
        index = 1;
    } else if (name === prevPage) {
        index = -1;
    }
    else {
        return null;
    }
    return (
        <SlidingPaneContainer index={index}>
            {children}
        </SlidingPaneContainer>
    );
}

const InvisibleButton = styled.button`
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    width: 100%;
    text-align: inherit;
    color: inherit;
    font: inherit;
    cursor: pointer;
    outline: none;
    box-shadow: none;
    appearance: none;
    display: inline-flex;
    align-items: center;
`;

const SlidingPaneNavContainerElm = styled.div`
    width: 100%;
    padding: 8px;
    &:hover {
        background-color:rgb(29, 29, 29);
        cursor: pointer;
    }
`

type SlidingPaneNavContainerProps = {
    children?: React.ReactNode;
    to: string;
}

export const SlidingPaneNavContainer = ({children, to}: SlidingPaneNavContainerProps) => {
    const { setNextPage, moveToNext, getCurrentPage, setPrevPage  } = useSlidingPane();
    const currentPage = getCurrentPage();
    const handleNavigation = () => {
        setPrevPage(currentPage);
        setNextPage(to);
        setTimeout(() => {
            moveToNext(to);
        }, 100);
    }

    return (
        <SlidingPaneNavContainerElm>
            <InvisibleButton onClick={handleNavigation}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                    <div>
                        {children}
                    </div>
                    <div style={{marginLeft: '8px', display: 'flex', alignItems: 'center'}}>
                        <Codicon name="chevron-right" /> 
                    </div>
                </div>
            </InvisibleButton>
        </SlidingPaneNavContainerElm>
    )
}

export const SlidingPaneBackButton = ({children}:{children:ReactNode}) => {
    const { moveToPrev } = useSlidingPane();
    return (
        <InvisibleButton onClick={()=>moveToPrev()}>
            {children}
        </InvisibleButton>
    )
}

export const NextButton = () => {
    const {  next, nextPage } = useSlidingPane();
    return (
        <button onClick={() => next(nextPage)} >
            Next
        </button>
    );
}

export const PevButton = () => {
    const {  prev, prevPage } = useSlidingPane();
    return (
        <button onClick={() => prev(prevPage)} >
            Prev
        </button>
    );
}

export const SlidingPaneHeader = ({children}: {children:ReactNode}) => {
    return (
        <div>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <SlidingPaneBackButton>
                    <Codicon name="chevron-left" />
                </SlidingPaneBackButton>
                {children}
            </div>
            <Divider/>
        </div>
    )
}


export const CopilotFooter = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
`;