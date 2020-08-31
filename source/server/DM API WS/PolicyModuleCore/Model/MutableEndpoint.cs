using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace PolicyModuleCore.Model
{
    internal class MutableEndpoint
    {
        private readonly List<string> _andRules = new List<string>();

        private readonly List<string> _orRules = new List<string>();

        private readonly NameTable _nameTable = new NameTable();

        private XmlNamespaceManager _namespaceResolver;

        public List<string> AndRules => this._andRules;

        public List<string> OrRules => this._orRules;

        public XmlNamespaceManager NamespaceResolver
        {
            get
            {
                if (this._namespaceResolver == null)
                {
                    this._namespaceResolver = new XmlNamespaceManager(this._nameTable);
                }

                return this._namespaceResolver;
            }
        }

        public string Path { get; set; }

        public bool AllowAnonymous { get; private set; } = false;

        public string Expression { get; set; } = null;

        public string Method { get; set; } = null;

        public bool IsAnd { get; set; }

        public void Add(string permission)
        {
            if (string.IsNullOrWhiteSpace(permission))
            {
                return;
            }

            if (IsAnd)
            {
                this._andRules.Add(permission);
            }
            else
            {
                this._orRules.Add(permission);
            }
        }

        public void Init()
        {
            this._orRules.Clear();
            this._andRules.Clear();
        }

        public void SetAllowAnonymous(string xmlValue)
        {
            if (!string.IsNullOrWhiteSpace(xmlValue))
            {
                AllowAnonymous = XmlConvert.ToBoolean(xmlValue);
            }
            else
            {
                AllowAnonymous = false;
            }
        }

        public RestResource CreateRestResource()
        {
            return new RestResource(this.Path, this.AllowAnonymous, this._andRules, this._orRules, this.Method);
        }

        public SoapEndpoint CreateSoapEndpoint()
        {
            XPathType xPathType = new XPathType(this.NamespaceResolver, this.Expression);
            return new SoapEndpoint(this.Path, this.AllowAnonymous, this._andRules, this._orRules, xPathType);
        }
    }
}
