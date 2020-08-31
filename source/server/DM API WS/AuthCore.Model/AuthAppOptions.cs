namespace AuthCore.Model
{
    public class AuthAppOptions
    {
        public string AlgorithmDefault { get; set; }
        public string AuthenticationProvider { get; set; }
        public string DbAuthenticationProvider { get; set; }
        public string CONN_STR { get; set; }
        public string RecoveryPasswordUrl { get; set; }
    }
}

