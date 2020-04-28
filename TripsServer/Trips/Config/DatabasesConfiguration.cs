using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Trips.Config
{
    public class DatabasesConfiguration
    {
        public bool UseRemote { get; set; }

        /// <summary>
        /// 0 - username, 1 - password
        /// </summary>
        public string RemoteTripsTemplate { get; set; }
        /// <summary>
        /// 0 - username, 1 - password
        /// </summary>
        public string RemotePicsTemplate { get; set; }

        /// <summary>
        /// 0 - service name, 1 - db file path
        /// </summary>
        public string LocalTripsTemplate { get; set; }
        /// <summary>
        /// 0 - service name, 1 - db file path
        /// </summary>
        public string LocalPicsTemplate { get; set; }
        public string LocalServerName { get; set; }
        public string LocalTripsPath { get; set; }
        public string LocalPicsPath { get; set; }

        public static DatabasesConfiguration Load()
        {
            XmlSerializer serializer = new XmlSerializer(typeof(DatabasesConfiguration));
            using (StreamReader sr = new StreamReader(
                new FileStream("dbconfig.xml", FileMode.Open, FileAccess.Read)))
            {
                object obj = serializer.Deserialize(sr);
                return (DatabasesConfiguration)obj;
            }
        }

        public static void CreateExample()
        {
            DatabasesConfiguration example = new DatabasesConfiguration();
            example.UseRemote = false;
            
            example.RemoteTripsTemplate = "Server=tcp:tripsdb-bn.database.windows.net,1433;Initial Catalog=TripsDB;Persist Security Info=False;User ID={0};Password={1};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
            example.RemotePicsTemplate = "Server=tcp:tripsdb-bn.database.windows.net,1433;Initial Catalog=PicsDB;Persist Security Info=False;User ID={0};Password={1};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
            // Because: why not

            example.LocalServerName = @"(localdb)\MSSQLLocalDB";
            example.LocalTripsPath = @"c:\your_local_dbfile.mdf";
            example.LocalTripsTemplate = "Data Source={0};AttachDbFilename=\"{1}\";Initial Catalog=TripsDB;Integrated Security=True";
            example.LocalPicsPath = @"c:\your_local_dbfile.mdf";
            example.LocalPicsTemplate = "Data Source={0};AttachDbFilename=\"{1}\";Initial Catalog=PicsDB;Integrated Security=True";

            XmlSerializer serializer = new XmlSerializer(typeof(DatabasesConfiguration));
            using (StreamWriter sw = new StreamWriter(
                new FileStream("dbconfig.example.xml", FileMode.Create, FileAccess.Write), Encoding.Unicode))
            {
                serializer.Serialize(sw, example);
            }
        }
    }
}
