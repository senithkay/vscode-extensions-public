import React from 'react';
import styled from '@emotion/styled';

const Item = styled.div({
    padding: '5px',
    overflow: 'hidden',
    '&:hover': {
        backgroundColor: "var(--list-hover-background)"
    },

});

const Method = styled.div({
    backgroundColor: 'seagreen',
    padding: '5px',
    width: "35px",
    display: "inline-block",
    fontWeight: "bolder",
    overflow: "hidden",
    wordWrap: "none",
    marginTop: "5px",
    curser: "pointer"
});

const Path = styled.div({
    padding: '5px',
    display: "inline-block",
    fontWeight: "bolder",
    overflow: "hidden",
    wordWrap: "none",
    marginTop: "5px",
    curser: "pointer"
});



const Overview = () => {
    return (
        <div>
            <h4>Services</h4>
            <Item>/helthcare</Item>
            <Item>
                <Method>POST</Method>
                <Path> /categories/[string doctorCategory]/reserve</Path>
            </Item>
        </div>
    );
};

export default Overview;

