using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // ✅ TOKEN kontrolü için gerekli
using InternShipProject1.Models;

namespace InternShipProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RehberController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RehberController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize] // ✅ Sadece token geçerli olanlar bu endpoint'e erişebilir
        [HttpGet]
        public async Task<IActionResult> GetPeople()
        {
            var kisiler = await _context.Rehber.ToListAsync();
            return Ok(kisiler);
        }
    }
}
