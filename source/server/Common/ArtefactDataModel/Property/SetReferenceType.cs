namespace ArtefactDataModel.Property
{
    public class SetReferenceType
    {
        //URN
        public string DataProvider { get; set; }
        //IDType provides a type which is used for restricting the characters in codes and IDs throughout all SDMX-ML messages. Valid characters include A-Z, a-z, @, 0-9, _, -, $. Regex: [A-Za-z0-9_@$-]+
        public string Id { get; set; }
    }
}
