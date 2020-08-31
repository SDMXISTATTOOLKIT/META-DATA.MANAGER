using System;
using System.Collections.Generic;
using System.Text;
using System.Xml;

namespace AuthCore.PolicyModuleCore.Model
{
    internal class MutableEndpoint
    {
        private readonly Dictionary<string, List<string>> _andRules = new Dictionary<string, List<string>>();
                        
        private readonly Dictionary<string, List<string>> _orRules = new Dictionary<string, List<string>>();
                         
        private readonly Dictionary<string, List<string>> _andGroupRules = new Dictionary<string, List<string>>();
                         
        private readonly Dictionary<string, List<string>> _orGroupRules = new Dictionary<string, List<string>>();

        private readonly NameTable _nameTable = new NameTable();

        private XmlNamespaceManager _namespaceResolver;

        public Dictionary<string, List<string>> AndRules => this._andRules;
        public Dictionary<string, List<string>> AndGroupRules => this._andGroupRules;
             
        public Dictionary<string, List<string>> OrRules => this._orRules;
        public Dictionary<string, List<string>> OrGroupRules => this._orGroupRules;

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

        public int Priority { get; set; } = Int32.MaxValue;

        public string Expression { get; set; } = null;

        public string Method { get; set; } = null;
        
        public AggregateType AggregateType { get; set; }
        

        public void Add(string type, string permission)
        {
            if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(permission))
            {
                return;
            }

            if (AggregateType == AggregateType.and)
            {
                if (!_andRules.ContainsKey(type))
                {
                    _andRules.Add(type, new List<string>());
                }
                this._andRules[type].Add(permission);
            }
            else if (AggregateType == AggregateType.or)
            {
                if (!_orRules.ContainsKey(type))
                {
                    _orRules.Add(type, new List<string>());
                }
                this._orRules[type].Add(permission);
            }
            else if (AggregateType == AggregateType.andGroup)
            {
                if (!_andGroupRules.ContainsKey(type))
                {
                    _andGroupRules.Add(type, new List<string>());
                }
                this._andGroupRules[type].Add(permission);
            }
            else if (AggregateType == AggregateType.orGroup)
            {
                if (!_orGroupRules.ContainsKey(type))
                {
                    _orGroupRules.Add(type, new List<string>());
                }
                this._orGroupRules[type].Add(permission);
            }
        }
        
        public void Init()
        {
            this._orRules.Clear();
            this._andRules.Clear();
            this._andGroupRules.Clear();
            this._orGroupRules.Clear();
            this.Priority = Int32.MaxValue;
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
            return new RestResource(this.Path, this.AllowAnonymous, this.Priority, this._andRules, this._orRules, this._andGroupRules, this._orGroupRules, this.Method);
        }

        public SoapEndpoint CreateSoapEndpoint()
        {
            XPathType xPathType = new XPathType(this.NamespaceResolver, this.Expression);
            return new SoapEndpoint(this.Path, this.AllowAnonymous, this.Priority, this._andRules, this._orRules, this._andGroupRules, this._orGroupRules, xPathType);
        }
    }

    internal enum AggregateType { and, andGroup, or, orGroup }
}
