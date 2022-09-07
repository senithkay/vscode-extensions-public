import lowcodedemo/democonnector.three;
import lowcodedemo/democonnector.two;
import lowcodedemo/democonnector.one;

function myfunction() returns error? {
    one:Client oneEp = new ();
    string getMessageResponse = check oneEp->getMessage();
    boolean readMessageResponse = oneEp->readMessage(id = 0, fq = 0, point = 0, bool = true);
    check oneEp->sendMessage(msg = "");
    string? viewMessageResponse = oneEp->viewMessage(id = 0);
    one:PaymentResponse testKeywordResponse = oneEp->testKeyword('client = 0, payment = {
        'order: 0,
        amount: 0,
        note: ""
    });
    two:Client twoEp = check new (token = "");
    string[] getMessagesResponse = twoEp->getMessages();
    [int, string] readMessageResponse1 = check twoEp->readMessage(ids = []);
    map<boolean|error> sendMessageResponse = check twoEp->sendMessage(msgList = {}, auth = {
        username: "",
        password: ""
    });
    map<string>? viewMessageResponse1 = twoEp->viewMessage(user = {
        id: 0,
        name: ""
    });
    two:Message updateMessageResponse = check twoEp->updateMessage(id = 0, message = {
        body: "",
        receiver: {
            id: 0,
            name: ""
        },
        sender: {
            id: 0,
            name: ""
        }
    });
    three:Client threeEp = check new (credentials = {
        username: "",
        password: ""
    }, user = {
        id: 0,
        name: ""
    });
    stream<three:Student> getStudentsResponse = check threeEp->getStudents();
    string|xml|json? searchMessageResponse = threeEp->searchMessage(());
}
