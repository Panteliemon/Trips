using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Trips.Config
{
    public class Keys
    {
        public string PasswordHashSeed { get; set; }
        public string AuthTokensKey { get; set; }
        public string AppDefaultUserPassword { get; set; }
        public string TripsUserPassword { get; set; }
        public string TripsAdminPassword { get; set; }

        public static Keys Load()
        {
            XmlSerializer serializer = new XmlSerializer(typeof(Keys));
            using (StreamReader sr = new StreamReader(
                new FileStream("keys.xml", FileMode.Open, FileAccess.Read)))
            {
                object obj = serializer.Deserialize(sr);
                return (Keys)obj;
            }
        }

        public static void CreateExample()
        {
            Keys example = new Keys();
            example.PasswordHashSeed = "123";
            example.AuthTokensKey = "123";
            example.AppDefaultUserPassword = "123";
            example.TripsUserPassword = "123";
            example.TripsAdminPassword = "123";
            XmlSerializer serializer = new XmlSerializer(typeof(Keys));
            using(StreamWriter sw = new StreamWriter(
                new FileStream("keys.example.xml", FileMode.Create, FileAccess.Write), Encoding.Unicode))
            {
                serializer.Serialize(sw, example);
            }
        }
    }
}
