﻿using System;
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

        /// <summary>
        /// For parameter which is concatenated ids - returns distinct parsed ids.
        /// Returns empty list if no success.
        /// </summary>
        public static List<int> ParseIds(string idsParameter, params char[] separators)
        {
            List<int> result = new List<int>();
            string[] parts = idsParameter.Split(separators, StringSplitOptions.RemoveEmptyEntries);
            foreach (string strId in parts)
            {
                if (int.TryParse(strId, out int id))
                {
                    if (!result.Contains(id))
                    {
                        result.Add(id);
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Returns if the specified string can be used as UrlId.
        /// Checks only that all chars are valid. Doesn't check: null or empty,
        /// or if string is a number.
        /// </summary>
        /// <param name="urlId"></param>
        public static bool AreAllCharsValidForUrlId(string urlId)
        {
            for (int i = 0; i < urlId.Length; i++)
            {
                if (!IsValidUrlIdChar(urlId[i]))
                {
                    return false;
                }
            }

            return true;
        }

        private static bool IsValidUrlIdChar(char cr)
        {
            return ((cr >= 'a') && (cr <= 'z'))
                   || ((cr >= 'A') && (cr <= 'Z'))
                   || ((cr >= '0') && (cr <= '9'))
                   || (cr == '-')
                   || (cr == '_');
        }
    }
}
