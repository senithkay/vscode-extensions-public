import React, { ReactNode, useEffect, useRef, useState } from "react";
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

//TODO: move it a common place
export type VisitedPagesElement = {
    name: string;
    params: any
}

export const SlidingWindow = ({children}:SlidingWindowProps) => {
    const [visitedPages, setVisitedPages] = useState<VisitedPagesElement[]>([{
        name: "PAGE1",
        params: {}
    }]); 
    const [prevPage, setPrevPage] = useState<VisitedPagesElement>();
    const [viewParams, setViewParams] = useState<any>();
    const [height, setHeight] = useState(DEFAULT_SLIDING_WINDOW_HEIGHT);
    const [width, setWidth] = useState(DEFAULT_SLIDING_WINDOW_WIDTH);
    const [clearAnimations, setClearAnimations] = useState(false);


    const moveToNext = (nextPage:VisitedPagesElement) => {
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
                height: height,
                width: width,
                setWidth: setWidth,
                setHeight: setHeight,
                moveToNext: moveToNext,
                moveToPrev: moveToPrev,
                visitedPages: visitedPages,
                setVisitedPages: setVisitedPages,
                clearAnimations: clearAnimations,
                setClearAnimations: setClearAnimations,
                // Add missing properties below
                prevPage: prevPage,
                params: viewParams,
                setParams: setViewParams,
                setPrevPage: setPrevPage
            }}>
            <SlidingWindowContainer style={{ height: height, width: width }}>
                {children}
            </SlidingWindowContainer>
        </SlidingPaneContext.Provider>
    );
}

export const SlidingPaneContainer = styled.div<{ index: number; isCurrent?: boolean; width?: string , clearAnimations?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 320px;
  padding: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: ${({ clearAnimations }:{clearAnimations:boolean}) =>
    clearAnimations ? 'none' : 'transform 0.3s ease-in-out, width 0.3s ease-in-out'};
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
    const {setHeight, setWidth, visitedPages, setClearAnimations, clearAnimations } = useSlidingPane();
    const [index, setIndex] = useState(1);
    const currentPage = visitedPages[visitedPages.length - 1];
    const prevVisitedPagesLength = useRef(visitedPages.length);
    useEffect(() => {
        setClearAnimations(true);
        setIndex(visitedPages.length >= prevVisitedPagesLength.current ? 1 : -1);
        if (name === currentPage.name) {
            setTimeout(() => {
                setClearAnimations(false);
            }, 50);
            setHeight(paneHeight || DEFAULT_SLIDING_WINDOW_HEIGHT);
            setWidth(paneWidth || DEFAULT_SLIDING_WINDOW_WIDTH);
            setTimeout(() => {
                setIndex(0);
            }, 50);
        }
        prevVisitedPagesLength.current = visitedPages.length;
    }, [visitedPages, name, currentPage, setClearAnimations, setHeight, setWidth, paneHeight, paneWidth]);

    return (
        <SlidingPaneContainer index={index} clearAnimations={clearAnimations}>
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
    to?: string;
    data?:any
}

export const SlidingPaneNavContainer = ({children, to, data}: SlidingPaneNavContainerProps) => {
    const { moveToNext, setParams  } = useSlidingPane();
    const handleNavigation = () => {
        if (!to) return;
        setParams(data)
        moveToNext({
            name: to,
            params: data
        });
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
    const { moveToPrev, setPrevPage, visitedPages } = useSlidingPane();
    const handleBackNavigation = () => {
        const prevPage =  visitedPages[visitedPages.length - 2];
        setPrevPage(prevPage);
         setTimeout(() => {
             moveToPrev();
        }, 50);
       
    }
    return (
       <>
            {visitedPages.length > 1 && (
                <InvisibleButton onClick={handleBackNavigation}>
                    <>{children}</>
                </InvisibleButton>
            )}
       </>
    )
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