import lowcodedemo/democonnector.one;

function myfunction() returns error? {
    one:Client oneEp = new ();
    string getMessageResponse = check oneEp->getMessage();
    boolean readMessageResponse = oneEp->readMessage(123, 123.4, 123.45, false);
    check oneEp->sendMessage("test message");
    string? viewMessageResponse = oneEp->viewMessage(123);
    one:PaymentResponse testKeywordResponse = oneEp->testKeyword(1234, {'order: 5678, amount: 200.50, note: "test note"});
}
