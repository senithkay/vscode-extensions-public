

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
    setSearchOption: React.Dispatch<React.SetStateAction<string[]>>;
    handleOnSearchTextClear: () => void;
}

const HeaderSearchBoxOptions: React.FC<HeaderSearchBoxOptionsProps> = ({
    searchTerm,
    searchOption,
    setSearchOption,
    handleOnSearchTextClear
}) => {
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