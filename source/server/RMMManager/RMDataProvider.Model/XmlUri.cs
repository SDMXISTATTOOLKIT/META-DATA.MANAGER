using System;
using System.Collections.Generic;
using System.Text;
using System.Xml.Serialization;

namespace RMDataProvider.Model
{
    [Serializable]
    public class XmlUri 
    {
        private string _Value;

        public XmlUri() { }
        public XmlUri(string source) { _Value = source; }

        //public XmlUri(string source) { _Value = new Uri(source); }

        public string UriValue
        {
            get
            {
                return this._Value;
            }
            set
            {
                this._Value = value;
            }
        }

        //public static implicit operator Uri(XmlUri o)
        //{
        //    return o == null ? null : o._Value;
        //}

        //public static implicit operator XmlUri(Uri o)
        //{
        //    return o == null ? null : new XmlUri(o);
        //}

    }
}
