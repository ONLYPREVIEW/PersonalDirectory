using Microsoft.EntityFrameworkCore;
using InternShipProject1.Models;

namespace InternShipProject1.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<Kisi> Rehber {get; set;} // EF bunu görmezse migration çalışmaz
        public DbSet<User> Users {get; set;}
    }
}
