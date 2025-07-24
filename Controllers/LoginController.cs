using Microsoft.AspNetCore.Mvc;
using InternShipProject1.Models;
using InternShipProject1.Helpers;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InternShipProject1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public LoginController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost]
        public IActionResult Post([FromBody] User loginData)
        {
            // 1. Girilen şifreyi hashle
            string hashedPassword = PasswordHasher.HashPassword(loginData.Password);

            // 2. Veritabanında kullanıcıyı hash'e göre kontrol et
            var user = _context.Users.FirstOrDefault(u =>
                u.Username == loginData.Username &&
                u.Password == hashedPassword);

            // 3. Sonuç kontrolü
            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Hatalı kullanıcı adı veya şifre" });
            }

            // 4. JWT ayarlarını appsettings.json'dan çek
            var jwtKey = _configuration["JwtSettings:Key"]!;
            var jwtIssuer = _configuration["JwtSettings:Issuer"]!;
            var jwtAudience = _configuration["JwtSettings:Audience"]!;

            // 5. Token üret
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            // 6. Başarılı giriş → token ve success döndür
            return Ok(new
            {
                success = true,
                token = tokenString
            });
        }
    }
}
    