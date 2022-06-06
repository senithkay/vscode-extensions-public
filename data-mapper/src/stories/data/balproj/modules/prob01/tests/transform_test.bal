import ballerina/io;
import ballerina/test;

@test:Config {
    dataProvider: dataIn
}
function transformTest(string inputFile, string expectedFile) returns error? {
    json inputJson = check io:fileReadJson(inputFile);
    InputMessage input = check inputJson.cloneWithType();
    TransformedMessage transformResult = transform(input);

    json expectedJson = check io:fileReadJson(expectedFile);
    TransformedMessage expected = check expectedJson.cloneWithType();
    test:assertEquals(transformResult, expected);
}
