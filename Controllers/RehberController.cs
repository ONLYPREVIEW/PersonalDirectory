using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
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

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetPeople()
        {
            var kisiler = await _context.Rehber.ToListAsync();
            return Ok(kisiler);
        }

        // ✅ Yeni kişi ekleme metodu eklendi
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> AddPerson([FromBody] Kisi yeniKisi)
        {
            if (yeniKisi == null)
                return BadRequest("Geçersiz veri.");

            await _context.Rehber.AddAsync(yeniKisi);
            await _context.SaveChangesAsync();

            return Ok(yeniKisi);
        }
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerson(int id)
        {
            var kisi = await _context.Rehber.FirstOrDefaultAsync(x => x.Id == id);
            if (kisi == null)
                return NotFound("Kişi bulunamadı.");

            _context.Rehber.Remove(kisi);
            await _context.SaveChangesAsync();

            return Ok("Kişi silindi.");
        }

    }
}
