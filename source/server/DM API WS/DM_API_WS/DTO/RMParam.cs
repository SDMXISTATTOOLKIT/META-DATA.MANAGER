namespace DM_API_WS.DTO
{
    /// <summary>
    /// RM parameter input
    /// </summary>
    public class RMParam
    {
        /// <summary>
        /// Metadata
        /// </summary>
        public string metadata { get; set; }
        /// <summary>
        /// Msd
        /// </summary>
        public string msd { get; set; }
        /// <summary>
        /// Report State
        /// </summary>
        public string reportState { get; set; }
        /// <summary>
        /// DCAT_IsMultilingual annotation value
        /// </summary>
        public string DCAT_IsMultilingual { get; set; }
        /// <summary>
        /// CustomIsPresentational annotation value
        /// </summary>
        public string CustomIsPresentational { get; set; }
    }
}
