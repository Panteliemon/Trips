using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Trips.Entities.Pics
{
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
}
