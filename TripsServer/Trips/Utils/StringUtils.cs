using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Trips.Utils
{
    public static class StringUtils
    {
        public static bool TryParseDateParam(string dateStr, out DateTime result)
        {
            result = default(DateTime);
            string[] split = dateStr.Split(new char[] { '.', '/' }, StringSplitOptions.RemoveEmptyEntries);
            if (split.Length == 3)
            {
                if (int.TryParse(split[0], out int day)
                    && int.TryParse(split[1], out int month)
                    && int.TryParse(split[2], out int year))
                {
                    try
                    {
                        result = new DateTime(year, month, day);
                        return true;
                    }
                    catch (ArgumentOutOfRangeException)
                    {
                    }
                }
            }

            return false;
        }
    }
}
