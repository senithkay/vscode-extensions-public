

import React, { useRef, useState } from 'react';
import { CheckBox, CheckBoxGroup, ClickAwayListener, Codicon } from '@wso2-enterprise/ui-toolkit';
import styled from '@emotion/styled';

const SearchOptionContainer = styled.div({
    position: "absolute", 
    top: "100%", 
    right: "0", 
    zIndex: 5, 
    backgroundColor: "var(--vscode-sideBar-background)", 
    padding: "5px" 
});

export const INPUT_FIELD_FILTER_LABEL = "in:";
export const OUTPUT_FIELD_FILTER_LABEL = "out:";

interface HeaderSearchBoxOptionsProps {
    searchTerm: string;
    searchOption: string[];
    searchOptionsData: {value:string,label:string}[];
    setSearchOption: React.Dispatch<React.SetStateAction<string[]>>;
    handleOnSearchTextClear: () => void;
}

export function HeaderSearchBoxOptions(props: HeaderSearchBoxOptionsProps) {
    const { searchTerm, searchOption, setSearchOption, handleOnSearchTextClear,searchOptionsData } = props;
    
    const [showSearchOption, setShowSearchOption] = useState(false);
    const showSearchOptionRef = useRef(null);

    const handleSearchOptionChange = (checked: boolean, value: string) => {
        if (checked) {
            if (searchOption.indexOf(value) === -1) {
                setSearchOption([value, ...searchOption]);
            }
        } else {
            setSearchOption(searchOption.filter(option => option !== value));
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "row" }}>
            {searchTerm && (
                <Codicon name="close" onClick={handleOnSearchTextClear} />
            )}

            <div>
                <div ref={showSearchOptionRef}>
                    <Codicon name={showSearchOption ? "chevron-up" : "chevron-down"} onClick={() => setShowSearchOption(!showSearchOption)} />
                </div>
                <ClickAwayListener onClickAway={() => { setShowSearchOption(false); }} anchorEl={showSearchOptionRef.current}>
                    {showSearchOption && (
                        <SearchOptionContainer>
                            <CheckBoxGroup direction="vertical">
                                {searchOptionsData.map((item)=>(
                                    <CheckBox
                                        checked={searchOption.indexOf(item.value) > -1}
                                        label={item.label}
                                        onChange={(checked) => {
                                            handleSearchOptionChange(checked, item.value);
                                        }}
                                        value={item.value}
                                    />
                                ))}
                            </CheckBoxGroup>
                        </SearchOptionContainer>
                    )}
                </ClickAwayListener>
            </div>
        </div>
    );
};

export default HeaderSearchBoxOptions;