using Microsoft.AspNetCore.Mvc;
using InternShipProject1.Models;
using InternShipProject1.Helpers;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using System.Net.Mail;
using System.Net;
using Microsoft.AspNetCore.WebUtilities;

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

        // ✅ Kullanıcı Girişi
        [HttpPost]
        public IActionResult Post([FromBody] User loginData)
        {
            string hashedPassword = PasswordHasher.HashPassword(loginData.Password);

            var user = _context.Users.FirstOrDefault(u =>
                u.Username == loginData.Username &&
                u.Password == hashedPassword);

            if (user == null)
            {
                return Unauthorized(new { success = false, message = "Hatalı kullanıcı adı veya şifre" });
            }

            var jwtKey = _configuration["JwtSettings:Key"]!;
            var jwtIssuer = _configuration["JwtSettings:Issuer"]!;
            var jwtAudience = _configuration["JwtSettings:Audience"]!;

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

            return Ok(new
            {
                success = true,
                token = tokenString
            });
        }

        // ✅ Şifre Değiştirme (Kullanıcı Girişliyken)
        [HttpPost("changepassword")]
        [Authorize]
        public IActionResult ChangePassword([FromBody] ChangePasswordModel model)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Kimlik doğrulanamadı.");

            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            string currentHashed = PasswordHasher.HashPassword(model.CurrentPassword);
            if (user.Password != currentHashed)
                return BadRequest("Mevcut şifre hatalı.");

            user.Password = PasswordHasher.HashPassword(model.NewPassword);
            _context.SaveChanges();

            return Ok("Şifre başarıyla güncellendi.");
        }

        

        // ✅ Yeni Şifreyi Kaydetme (Kullanıcı Linkten Geldiyse)
        [HttpPost("reset")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest model)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == model.Email);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            user.Password = PasswordHasher.HashPassword(model.NewPassword);
            _context.SaveChanges();

            return Ok("Şifre başarıyla güncellendi.");
        }

        // ✅ MODELLER
        public class ChangePasswordModel
        {
            public string CurrentPassword { get; set; }
            public string NewPassword { get; set; }
        }

        public class ForgotPasswordRequest
        {
            public string Email { get; set; }
        }

        public class ResetPasswordRequest
        {
            public string Email { get; set; }
            public string NewPassword { get; set; }
        }
    }
}
