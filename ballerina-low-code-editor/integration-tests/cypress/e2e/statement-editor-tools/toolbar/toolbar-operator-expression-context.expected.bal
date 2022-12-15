function testStatementEditorComponents() returns error? {
    int var1 = 1;
    int var2 = 2;
    var variable = (from int? item in [1, 2, 3]
        where item != var1
        select var1);
}
