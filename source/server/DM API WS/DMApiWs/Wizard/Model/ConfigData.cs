using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace DM_API_WS.Wizard.Model
{
    /// <summary>
    /// Class for data configuration
    /// </summary>
    public class ConfigData
    {
        /// <summary>
        /// Username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Password
        /// </summary>
        [DataType(DataType.Password)]
        public string Password { get; set; }
        
        /// <summary>
        /// Mapping Assistant
        /// </summary>
        public string MA { get; set; }

        /// <summary>
        /// Whether AuthDb is initilized or not
        /// </summary>
        public bool AuthDbBaseInitialized { get; set; }

        /// <summary>
        /// Whether AuthDb is extended or not
        /// </summary>
        public bool AuthDbExtInitialized { get; set; }

        /// <summary>
        /// List of mapping stores
        /// </summary>
        public List<string> MappingStores { get; set; }

        /// <summary>
        /// Selected Mapping Store
        /// </summary>
        public string SelectedMappingStore { get; set; }

        /// <summary>
        /// Status of the selected Mapping STore
        /// </summary>
        public bool StatusSelectedMappingStore { get; set; }

        /// <summary>
        /// Error in Mapping Store Selection
        /// </summary>
        public bool ErrorSelectedMappingStore { get; set; }

        /// <summary>
        /// Status of the DDB
        /// </summary>
        public bool? StatusDDB { get; set; }

        /// <summary>
        /// DDB Error
        /// </summary>
        public bool ErrorDDB { get; set; }

        /// <summary>
        /// Status of the RMDB
        /// </summary>
        public bool? StatusRMDB { get; set; }

        /// <summary>
        /// RMDB Error
        /// </summary>
        public bool ErrorRMDB { get; set; }

        /// <summary>
        /// Action for the step.
        /// </summary>
        public string StepAction { get; set; }

        /// <summary>
        /// Message for the step.
        /// </summary>
        public string StepMessage { get; set; }

        /// <summary>
        /// Version of the AuthDB
        /// </summary>
        public string AuthDbVersion { get; set; }

        /// <summary>
        /// Version of the Mapping Store
        /// </summary>
        public string MappingStoreVersion { get; set; }
    }

}
