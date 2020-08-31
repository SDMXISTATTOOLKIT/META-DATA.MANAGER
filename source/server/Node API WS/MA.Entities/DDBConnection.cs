using System;
using System.Collections.Generic;
using System.Data.SqlClient;

namespace MA.Entities
{
    public class DDBConnection : MAEntity
    {
        public string type { get; set; }
        public Dictionary<string, Property> properties { get; set; }
        public Dictionary<string, string> details { get; set; }
        public List<Link> links { get; set; }

        public DDBConnection(string name, string type, string server, string database, string userId, string password, bool integratedSecurity) : base(name)
        {
            this.type = type;

            Dictionary<string, Property> prop = new Dictionary<string, Property>();
            prop.Add("server", new Property(server));
            prop.Add("database", new Property(database));
            prop.Add("user id", new Property(userId));
            prop.Add("password", new Property(password));
            prop.Add("integrated security", new Property(integratedSecurity.ToString()));

            this.properties = prop;
        }

        public DDBConnection(string name, string type, SqlConnectionStringBuilder sqlConn) : base(name)
        {
            this.type = type;

            Dictionary<string, Property> prop = new Dictionary<string, Property>();
            prop.Add("server", new Property(sqlConn.DataSource));
            prop.Add("database", new Property(sqlConn.InitialCatalog));
            prop.Add("user id", new Property(sqlConn.UserID));
            prop.Add("password", new Property(sqlConn.Password));
            prop.Add("integrated security", new Property(sqlConn.IntegratedSecurity.ToString()));

            this.properties = prop;
        }
    }
}