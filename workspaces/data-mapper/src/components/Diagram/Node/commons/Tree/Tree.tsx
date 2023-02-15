import styled from "@emotion/styled";

export const TreeContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 16px 24px 24px;
    gap: 8px;
    background: #FFFFFF;
    box-shadow: 0px 5px 50px rgba(203, 206, 219, 0.5);
    border-radius: 12px;
    color: #1D2028;
    font-family: GilmerMedium;
    font-style: normal;
    font-weight: 600;
    font-size: 13px;
    line-height: 24px;
`;

export const TreeHeader = styled.div((
    { isSelected, isDisabled }: { isSelected?: boolean, isDisabled?: boolean }
) => ({
    height: '40px',
    padding: '8px',
    background: `${isDisabled ? '#F7F8FB' : isSelected ? '#DFE2FF' : '#E6E8F0'}`,
    borderRadius: '3px',
    width: '100%',
    display: 'flex',
    cursor: `${isDisabled ? 'not-allowed' : 'pointer'}`,
    '&:hover': {
        backgroundColor: `${isDisabled ? '#F7F8FB' : '#F0F1FB'}`
    }
}));

export const TreeBody = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1px;
    gap: 1px;
    background: #E0E2E9;
    border-radius: 3px;
    flex: none;
    flex-grow: 0;
    width: 100%;
    cursor: pointer;
`;
