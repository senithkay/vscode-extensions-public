

import React, { useRef } from 'react';
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
    showSearchOption: boolean;
    setShowSearchOption: (show: boolean) => void;
    handleOnSearchTextClear: () => void;
    handleSearchOptionChange: (checked: boolean, value: string) => void;
}

const HeaderSearchBoxOptions: React.FC<HeaderSearchBoxOptionsProps> = ({
    searchTerm,
    searchOption,
    showSearchOption,
    setShowSearchOption,
    handleOnSearchTextClear,
    handleSearchOptionChange
}) => {
    const showSearchOptionRef = useRef(null);

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
                                <CheckBox
                                    checked={searchOption.indexOf(INPUT_FIELD_FILTER_LABEL) > -1}
                                    label="Filter in inputs"
                                    onChange={(checked) => {
                                        handleSearchOptionChange(checked, INPUT_FIELD_FILTER_LABEL);
                                    }}
                                    value={INPUT_FIELD_FILTER_LABEL}
                                />
                                <CheckBox
                                    checked={searchOption.indexOf(OUTPUT_FIELD_FILTER_LABEL) > -1}
                                    label="Filter in outputs"
                                    onChange={(checked) => {
                                        handleSearchOptionChange(checked, OUTPUT_FIELD_FILTER_LABEL);
                                    }}
                                    value={OUTPUT_FIELD_FILTER_LABEL}
                                />
                            </CheckBoxGroup>
                        </SearchOptionContainer>
                    )}
                </ClickAwayListener>
            </div>
        </div>
    );
};

export default HeaderSearchBoxOptions;