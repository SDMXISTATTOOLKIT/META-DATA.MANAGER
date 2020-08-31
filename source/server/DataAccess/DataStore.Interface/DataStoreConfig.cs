using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataStore.Interface
{    
    public class DataStoreConfig
    {
        public class BoundingBox
        {
            public double MinX;
            public double MaxX;
            public double MinY;
            public double MaxY;

            public BoundingBox(double minX, double maxX, double minY, double maxY)
            {
                MinX = minX;
                MaxX = maxX;
                MinY = minY;
                MaxY = maxY;
            }
        }

        /// <summary>
        /// Stringa di connessione al DB
        /// </summary>
        public string connStr;

        /// <summary>
        /// Schema da utilizzare per l'acceso ai dati
        /// </summary>
        public string schema;

        /// <summary>
        /// Nome del campo utilizzato come chiave primaria delle entità
        /// </summary>
        public string idField;

        /// <summary>
        /// Lunghezza del campo chiave
        /// </summary>
        public int idFieldLength;

        /// <summary>
        /// Lunghezza del prefisso del campo chiave
        /// </summary>
        public int idFieldPrefixLength;

        /// <summary>
        /// Indica il formato della data.
        /// </summary>
        public string DateFormat;

        /// <summary>
        /// Indica il carattere utilizzato per separare le cifre decimali da quelle intere.
        /// </summary>
        public string DecimalSeparator;
    }
}
