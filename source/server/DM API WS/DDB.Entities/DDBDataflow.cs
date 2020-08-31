using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace DDB.Entities
{
    public class DDBDataflow
    {
        public int IDDataflow { get; set; }
        public int IDCube { get; set; }
        public string ID { get; set; }
        public string Agency { get; set; }
        public string Version { get; set; }
        //START use for filter
        public Filter Filter { get; set; }
        public SqlData SqlData { get; set; }
        //END use for filter
        public bool HasTranscoding { get; set; }
        public bool HasContentConstraints { get; set; }
        public DateTime LastUpdate { get; set; }
        public Dictionary<string, string> labels { get; set; }
        public string viewName { get; set; }

        public DDBDataflow(int IDDataflow, int IDCube, string ID, string Agency, string Version, Filter filter, bool HasTranscoding, bool HasContentConstraints, DateTime lastUpdate, Dictionary<string, string> labs)
        {
            this.IDDataflow = IDDataflow;
            this.IDCube = IDCube;
            this.ID = ID;
            this.Agency = Agency;
            this.Version = Version;
            this.Filter = filter;
            this.HasTranscoding = HasTranscoding;
            this.HasContentConstraints = HasContentConstraints;
            this.LastUpdate = lastUpdate;
            this.labels = labs;
            this.viewName = $"Dataset_DF{IDDataflow}_ViewCurrentData";
        }
    }

    public class Filter
    {
        static string[] Operators = new[] { "=", "<>", ">", "<", "LIKE", "IN", "NOT IN", ">=", "<=" };

        public Dictionary<int, List<FilterObject>> FiltersGroupAnd { get; set; }
        public Dictionary<int, List<FilterObject>> FiltersGroupOr { get; set; }

        public string ToSql()
        {
            StringBuilder sb = new StringBuilder();

            convertGroup(sb, FiltersGroupAnd, true);

            convertGroup(sb, FiltersGroupOr, false);

            return sb.ToString();
        }

        static void convertGroup(StringBuilder sb, Dictionary<int, List<FilterObject>> filtersGroup, bool andWhere)
        {
            if (filtersGroup != null && filtersGroup.Count > 0)
            {
                foreach (var itemGroup in filtersGroup)
                {
                    if (sb.Length > 0)
                    {
                        if (andWhere)
                        {
                            sb.Append($" AND ");
                        }
                        else
                        {
                            sb.Append($" OR ");
                        }
                    }
                    sb.Append($"(");
                    if (itemGroup.Value == null || (itemGroup.Value.Count <= 0))
                    {
                        continue;
                    }

                    var itemFilter = 0;
                    foreach (var filterItemGroup in itemGroup.Value)
                    {
                        if (itemFilter > 0)
                        {
                            sb.Append($" {normalizeAndOr(filterItemGroup.WhereAndOr)} ");
                        }

                        if (filterItemGroup.Operator.Trim().ToUpperInvariant().Equals("IN") ||
                            filterItemGroup.Operator.Trim().ToUpperInvariant().Equals("NOT IN"))
                        {
                            var strValueConvert = filterItemGroup.Operator;
                            sb.Append($"[{normalizeColumnName(filterItemGroup.ColumnName)}] {normalizeOperator(filterItemGroup.Operator)} {normalizeInNotInStringValue(filterItemGroup.FilterValues)}");
                        }
                        else
                        {
                            sb.Append($"[{normalizeColumnName(filterItemGroup.ColumnName)}] {normalizeOperator(filterItemGroup.Operator)} '{normalizeStringValue(filterItemGroup.FilterValues.FirstOrDefault())}'");
                        }

                        itemFilter++;
                    }
                    sb.Append($")");
                }
            }
        }

        static private string normalizeColumnName(string columnName)
        {
            if (columnName == null)
            {
                return "";
            }

            return columnName.Replace("[", "").Replace("]", "").Replace(";", "");
        }

        static private string normalizeOperator(string operatorName)
        {
            if (Operators.Contains(operatorName.ToUpperInvariant().Trim()))
            {
                return operatorName.Trim();
            }

            return "=";
        }
        static private string normalizeAndOr(string andOr)
        {
            if (andOr != null && andOr.Trim().Equals("AND"))
            {
                return "AND";
            }

            return "OR";
        }

        static private string normalizeStringValue(string valueStr)
        {
            if (valueStr == null)
            {
                return "";
            }

            return valueStr.Replace("'", "''");
        }

        static private string normalizeInNotInStringValue(List<string> valuesStr)
        {
            var sb = new StringBuilder();
            if (valuesStr == null)
            {
                return null;
            }
            sb.Append("(");
            foreach (var item in valuesStr)
            {
                if (sb.Length > 1)
                {
                    sb.Append(",");
                }
                sb.Append("'" + item.Replace("'", "''") + "'");
            }
            sb.Append(")");

            return sb.ToString();
        }


        static public Dictionary<int, List<FilterObject>> BasicFilterFromSql(string sqlFilter, bool forSqlExecute)
        {
            var filter = new Dictionary<int, List<FilterObject>>();
            if (string.IsNullOrWhiteSpace(sqlFilter))
            {
                return filter;
            }

            var tokens = sqlFilter.Split(new string[] { " AND ", " OR " }, StringSplitOptions.RemoveEmptyEntries);

            var iGroup = 0;
            foreach (var tok in tokens)
            {
                if (!filter.ContainsKey(iGroup))
                {
                    filter.Add(iGroup, new List<FilterObject>());
                }

                var isAndOperator = true;
                var index = sqlFilter.IndexOf(tok);
                if (index - 4 > 0)
                {
                    isAndOperator = sqlFilter.Substring(index - 4, 3).Contains("AND", StringComparison.InvariantCultureIgnoreCase);
                }

                if (tok.Contains(" IN ") || tok.Contains(" NOT IN "))
                {
                    filter[iGroup].AddRange(inWhere(tok, forSqlExecute, isAndOperator));
                }
                else
                {
                    filter[iGroup].AddRange(genericWhere(tok, forSqlExecute, isAndOperator));
                }
                if (tok.EndsWith(")"))
                {
                    iGroup++;
                }
            }
            return filter;
        }

        static private List<FilterObject> inWhere(string sql, bool forSqlExecute, bool isAndOperator)
        {
            var filters = new List<FilterObject>();

            var args = sql.Split(" ");

            var filterObject = new FilterObject
            {
                ColumnName = args[0].Replace("[", "").Replace("]", "").Trim('('),
                ColumnType = "string",
                FilterValues = new List<string>(),
                WhereAndOr = isAndOperator ? "AND" : "OR"
            };

            filterObject.Operator = args[1];
            if (filterObject.Operator.Contains("NOT"))
            {
                filterObject.Operator = "NOT IN";
            }

            if (filterObject.Operator.ToUpperInvariant().Trim().Equals("IN") ||
                filterObject.Operator.ToUpperInvariant().Trim().Equals("NOT IN"))
            {
                if (args.Length > 2)
                {
                    var valuesIn = args[args.Length - 1].Split(",");
                    foreach (var itemValue in valuesIn)
                    {
                        filterObject.FilterValues.Add(itemValue.TrimEnd(',').TrimStart('(').TrimEnd(')').TrimStart('\'').TrimEnd('\''));
                    }
                }
            }
            else
            {
                foreach (Match c in Regex.Matches(sql, @"\((.*?)\)"))
                {
                    var values = c.Groups[1].ToString().Split(",");
                    foreach (var valueColumn in values)
                    {
                        filterObject.FilterValues.Add(valueColumn.TrimStart('\'').TrimEnd('\''));
                    }
                }
            }
            filters.Add(filterObject);

            return filters;
        }

        static private List<FilterObject> genericWhere(string sql, bool forSqlExecute, bool isAndOperator)
        {
            var filters = new List<FilterObject>();

            var tokens = sql.Split(" AND | OR ");
            //foreach (Match c in Regex.Matches(sql, @"\((.*?)\)"))
            {
                //var tokens = c.Groups[1].ToString().Split(" AND | OR ");

                var iFilter = 0;
                foreach (string tokDirty in tokens)
                {
                    var tok = tokDirty.TrimStart('(').TrimEnd(')');
                    var index = sql.IndexOf(tok);
                    if (index - 4 > 0)
                    {
                        isAndOperator = sql.Substring(index - 4, 3).Contains("AND", StringComparison.InvariantCultureIgnoreCase);
                    }

                    var args = tok.Split(" ");
                    var haveCondition = args.Length > 0;
                    var checkCount = 0;
                    while (haveCondition)
                    {
                        var nameColumn = 0;
                        var operatorColumn = 1;
                        var valueColumn = 2;
                        if (checkCount > 0)
                        {
                            nameColumn = 4 * checkCount;
                            operatorColumn = (4 * checkCount) + 1;
                            valueColumn = (4 * checkCount) + 2;
                        }

                        filters.Add(new FilterObject
                        {
                            ColumnName = args[nameColumn].Replace("[", "").Replace("]", ""),
                            ColumnType = "string",
                            FilterValues = new List<string> { args[valueColumn].TrimStart('\'').TrimEnd('\'') },
                            Operator = args[operatorColumn],
                            WhereAndOr = isAndOperator ? "AND" : "OR"
                        });

                        checkCount++;
                        if (args.Length <= valueColumn + 1)
                        {
                            haveCondition = false;
                        }
                    }
                    iFilter++;
                }
            }

            return filters;
        }

    }

    public class FilterObject
    {
        public string ColumnName { get; set; }
        public string ColumnType { get; set; } //string, numeric
        public string WhereAndOr { get; set; } //First Column ignore this paramiter
        public string Operator { get; set; }
        public List<string> FilterValues { get; set; }
    }

    public class SqlData
    {
        public List<string> SelCols { get; set; }
        public List<string> SortCols { get; set; }
        public bool SortByDesc { get; set; }
        public int NumPage { get; set; }
        public int PageSize { get; set; }
    }

}