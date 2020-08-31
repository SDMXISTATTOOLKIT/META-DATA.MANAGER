using System;
using System.Collections.Generic;
using System.Text;

namespace DataModel
{
    public class NoSQLCodeList
    {
        public string Id { get; set; }
        public string AgencyID { get; set; }
        public string Version { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Description { get; set; }
        public Dictionary<string, string> Descriptions { get; set; }
        public DateTime ValidFrom { get; set; }
        public DateTime ValidTo { get; set; }
        public string Uri { get; set; }
        public string Urn { get; set; }
        public bool? IsFinal { get; set; }
        public List<NoSQLCodeListItemAnnotationProperty> Annotations { get; set; }

        public bool Changed { get; set; }
        public bool Expired { get; set; }
        public DateTime InsertDate { get; set; }
        public DateTime LastSync { get; set; }
        public DateTime ValidUntil { get; set; }
        public int ItemsCount { get; set; }

        public NoSQLCodeList()
        {
            Names = new Dictionary<string, string>();
            Descriptions = new Dictionary<string, string>();
            Annotations = new List<NoSQLCodeListItemAnnotationProperty>();
        }
    }

    public class NoSQLCodeListItem
    {
        public int Id { get; set; }
        public int RefId { get; set; }
        public string ItemCode { get; set; }
        public string Parent { get; set; }
        public string Name { get; set; }
        public Dictionary<string, string> Names { get; set; }
        public string Desc { get; set; }
        public Dictionary<string, string> Descs { get; set; }
        public int TreePosition { get; set; }
        public bool Changed { get; set; }
        public List<NoSQLCodeListItemAnnotationProperty> Annotations { get; set; }
        public Dictionary<string, int> Order { get; set; }
        public bool AutoSave { get; set; }

        public NoSQLCodeListItem()
        {
            Parent = "";
            Names = new Dictionary<string, string>();
            Descs = new Dictionary<string, string>();
            Annotations = new List<NoSQLCodeListItemAnnotationProperty>();
            Order = new Dictionary<string, int>();
        }
    }

    public class NoSQLMoveCodeListItem
    {
        public string ItemCode { get; set; }
        public string Parent { get; set; }
        public string MoveBefore { get; set; }
        public string MoveAfter { get; set; }
        public bool AutoSave { get; set; }
    }

    public class NoSQLCodeListItemAnnotationProperty
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string Type { get; set; }
        public int Order { get; set; }
        public Dictionary<string, string> Texts { get; set; }

        public NoSQLCodeListItemAnnotationProperty()
        {
            Texts = new Dictionary<string, string>();
        }
    }

    public class NoSQLCodeListItemOrderProperty
    {
        public double OrderValue { get; set; }
    }

    public class Node
    {
        public List<Node> Children = new List<Node>();
        public Node Parent { get; set; }
        public NoSQLCodeListItem AssociatedObject { get; set; }
        public int Descendants { get; set; }
    }

    public class NoSqlSearchParameters
    {
        public string Id { get; set; }
        public string AgencyId { get; set; }
        public string Version { get; set; }
        public string Lang { get; set; }
        public string Token { get; set; }
        public int PageSize { get; set; }
        public int PageNum { get; set; }
        public string CodeSearch { get; set; }
        public string NameSearch { get; set; }
        public string ParentSearch { get; set; }
        public string AllSearch { get; set; }
        public string SortColumn { get; set; }
        public bool SortDesc { get; set; }
        public string ItemForParent { get; set; }
        public SearchType SearchType { get; set; }
        public bool RebuildDb { get; set; }
        public List<string> Output_ConflictItem { get; set; }
        public bool Output_HaveConflictItem { get; set; }
    }

    public class NoSqlSaveInput
    {
        public bool IsOrder { get; set; } //All items have annotation order for specific lang
        public bool PreviousIsFinal { get; set; }
        public bool HaveAnyAnnotationOrder { get; set; } //Almost one item have annotation order for specific lang
        public bool ChangeAnnotationOrder { get; set; }
    }

    public class NoSQLNodeParent
    {
        public string ItemCode { get; set; }
        public string Parent { get; set; }
        public string Name { get; set; }


        public NoSQLNodeParent()
        {
        }
    }

    public enum SearchType { Get, Save, ParentsAvailable }
}
