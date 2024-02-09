/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */


import React, { useEffect } from "react";
import { VisualizerLocation, GettingStartedSample, GettingStartedCategory, SampleDownloadRequest } from "@wso2-enterprise/mi-core";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import { Dropdown, Grid, SearchBox } from "@wso2-enterprise/ui-toolkit";
import { Button } from "@wso2-enterprise/ui-toolkit";
import { SAMPLE_ICONS_GITHUB_URL } from "../constants";

export function SamplesView() {
    const { rpcClient } = useVisualizerContext();
    const [state, setState] = React.useState<VisualizerLocation>(null);
    const [filteredSampleData, setFilteredSamples] = React.useState<GettingStartedSample[]>(null);
    const [filteredSampleDataCopy, setFilteredSampleDataCopy] = React.useState<GettingStartedSample[]>(null);
    const [SampleData, setSampleData] = React.useState<GettingStartedSample[]>(null);
    const [categories, setCategories] = React.useState<GettingStartedCategory[]>(null);
    const [images, setImages] = React.useState<string[]>([]);
    const [searchText, setSearch] = React.useState<string>("");
    const [filterText, setFilterText] = React.useState<string>("");

    useEffect(() => {
        if (rpcClient) {
            rpcClient.getVisualizerState().then((initialState) => {
                setState(initialState);
            });
            rpcClient.getMiVisualizerRpcClient().fetchSamplesFromGithub().then((samples) => {
                setSampleData(samples.samples);
                setFilteredSamples(samples.samples);
                setFilteredSampleDataCopy(samples.samples);
                setCategories(samples.categories);
                let urls = [];
                for (let i = 0; i < samples.categories.length; i++) {
                    urls.push(SAMPLE_ICONS_GITHUB_URL + samples.categories[i].icon);
                }
                setImages(urls);
            });
        }
    }, [rpcClient]);

    const handleChange = (value: string) => {
        let categoryId = categories.find(category => category.title === value).id;
        let filteredData = SampleData.filter(sample => sample.category === categoryId);
        setFilteredSamples(filteredData);
        setFilteredSampleDataCopy(filteredData);
        setFilterText(value);
    }

    const handleSearch = (searchText: string) => {
        console.log("searchText", searchText);
        setSearch(searchText);
        if (searchText !== "") {
            let filteredData = filteredSampleDataCopy.filter(sample => sample.title.toLowerCase().includes(searchText.toLowerCase()));
            setFilteredSamples(filteredData);
        } else {
            setFilteredSamples(filteredSampleDataCopy);
        }
    }

    function downloadSample(sampleName: string) {
        let request: SampleDownloadRequest = {
            zipFileName: sampleName
        }
        rpcClient.getMiVisualizerRpcClient().downloadSelectedSampleFromGithub(request);
    }

    return (
        <>
            <div>
                <h1>Try out a sample</h1>
                <p>Choose a sample from the list below to get started.</p>
                <Grid
                    columns={2}
                    direction="column">
                    <Dropdown
                        id="drop-down"
                        items={categories ? categories.map(category => ({
                            key: category.id - 1,
                            text: category.title,
                            value: category.title
                        })) : null}
                        label="Sample Category"
                        onChange={handleChange}
                        value={filterText}
                    />
                    <SearchBox
                        value={searchText}
                        autoFocus
                        label="Search"
                        type="text"
                        onChange={handleSearch}
                    /></Grid>
                <br />
                <Grid
                    columns={6}
                    direction="column">
                    {filteredSampleData ? filteredSampleData.sort((a, b) => a.priority - b.priority).map((sample, index) => (
                        <div key={sample.title} style={{ border: '1px solid #ccc', padding: '16px', marginBottom: '16px' }}>
                            <h2 className="card-title" style={{ margin: '0', fontSize: '16px' }}>{sample.title}</h2>
                            <img src={images[sample.category - 1]} className="card-image" style={{ width: '50%', height: 'auto' }} />
                            <p className="card-content" style={{ marginTop: '16px' }}>{sample.description}</p>
                            <Button appearance="primary" onClick={() => downloadSample(sample.zipFileName)}>Download</Button>
                        </div>
                    )) : null}
                </Grid>
            </div>
        </>
    );
}
