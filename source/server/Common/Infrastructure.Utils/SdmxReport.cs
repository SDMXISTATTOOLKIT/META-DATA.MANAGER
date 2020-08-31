using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Utils
{
    public class SdmxReport
    {
        public Dictionary<string, string> ReportDictionary;
        public Dictionary<string, string> WarnDictionary;
        public string[] WrongLines;

        public SdmxReport(string elapsedTime, int numRows, int numSeries, string fileName, Dictionary<string, string> warnDict, string[] wrongLines)
        {
            ReportDictionary = new Dictionary<string, string>();
            ReportDictionary.Add("FILE_IMPORT_ELAPSED_TIME", elapsedTime);
            ReportDictionary.Add("FILE_IMPORT_NUM_ROWS", numRows.ToString());
            ReportDictionary.Add("FILE_IMPORT_NUM_SERIES", numSeries.ToString());
            ReportDictionary.Add("FILE_IMPORT_FILE_NAME", fileName);

            WarnDictionary = warnDict;
            WrongLines = wrongLines;
        }
    }
}
