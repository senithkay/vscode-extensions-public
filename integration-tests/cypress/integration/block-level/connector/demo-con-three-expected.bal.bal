import lowcodedemo/democonnector.three;

function myfunction(three:Client threeEpParam) returns error? {
    three:Client threeEpLocal = check new ({username: "user123", password: "pass"}, {id: 123, name: "user"});
    stream<three:Student> getStudentsResponse = check threeEpLocal->getStudents();
    string|xml|json? searchMessageResponse = threeEpParam->searchMessage("test message");
}
