namespace HooverUnlimited.DotNetRtfWriter
{
    public class RtfFieldControlWord : RtfRenderable
    {
        public enum FieldType
        {
            None = 0,
            Page,
            NumPages,
            Date,
            Time
        }

        private static readonly string[] ControlWordPool =
        {
            // correspond with FiledControlWords enum
            "",
            @"{\field{\*\fldinst PAGE }}",
            @"{\field{\*\fldinst NUMPAGES }}",
            @"{\field{\*\fldinst DATE }}",
            @"{\field{\*\fldinst TIME }}"
        };

        private readonly FieldType _type;

        internal RtfFieldControlWord(int position, FieldType type)
        {
            Position = position;
            _type = type;
        }

        internal int Position { get; }

        public override string Render()
        {
            return ControlWordPool[(int) _type];
        }
    }
}