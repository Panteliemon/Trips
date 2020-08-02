using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Trips.Entities.Pics
{
    /* REMOVED.
     * Picture storage, for the first 2 months of the project when pictures were stored in DB.
     * Commented code left for history.
    // -context Trips.Entities.Pics.PicsContext
    public class PicsContext : DbContext
    {
        public PicsContext()
        {
        }

        public PicsContext(DbContextOptions<PicsContext> options)
            : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(Program.PicsConnectionString);
        }

        public DbSet<PicData> PicData { get; set; }
    }
    */
}
