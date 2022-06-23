import lowcodedemo/democonnector.two;

two:Client twoEp = check new ("abcdefg1234");

function myfunction() returns error? {
    string[] getMessagesResponse = twoEp->getMessages();
    [int, string] readMessageResponse = check twoEp->readMessage([11, 22]);
    map<boolean|error> sendMessageResponse = check twoEp->sendMessage({"key1": "value1"}, {username: "user", password: "pass"});
    map<string>? viewMessageResponse = twoEp->viewMessage({id: 123, name: "user"});
    two:Message updateMessageResponse = check twoEp->updateMessage(123, {body: "sample text message", receiver: {id: 456, name: "user456"}, sender: {id: 789, name: "user789"}});
}
