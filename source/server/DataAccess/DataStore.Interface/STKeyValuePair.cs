using System;

namespace DataStore.Interface
{
    /// <summary>
    /// Rappresenta una coppia chiave valore serializzabile.
    /// </summary>
    public class STKeyValuePair
    {
        private string mKey;
        private object mValue;
        private Type mParamType;


        public STKeyValuePair(string key, object value)
        {
            mKey = key;

            mValue = value;
        }

        public STKeyValuePair(string key, Type type)
        {
            mKey = key;
            mParamType = type;
            mValue = null;
        }


        /// <summary>
        /// Imposta o restituisce la chiave.
        /// </summary>
        public string Key
        {
            get
            {
                return mKey;
            }
            set
            {
                mKey = value;
            }
        }

        /// <summary>
        /// Imposta o restituisce il valore.
        /// </summary>
        public object Value
        {
            get
            {
                return mValue;
            }
            set
            {
                mValue = value;
            }
        }


        /// <summary>
        /// Imposta o restituisce il valore.
        /// </summary>
        public Type ParamType
        {
            get
            {
                return mParamType;
            }
            set
            {
                mParamType = value;
            }
        }

    }
}
