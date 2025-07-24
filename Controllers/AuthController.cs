using Microsoft.AspNetCore.Mvc;

namespace InternShipProject1.Controllers
{
    [ApiController] // burada attribute atandı. Bu sınıf web api controller demektir yani dışarıdan HTTp istekleri alabilir
    [Route("api/[controller]")] // sınıfa gelecek olan URL nin ne olacağını tanımlar
    public class AuthController : ControllerBase // HTTP işlemlerini dinleyen kısım
    {
        [HttpPost("login")] // dışarıdan HTTP POST isteğiyle çağrılabilir. Son URL parçası login dir
        public IActionResult Login([FromForm] string username, [FromForm] string password) // IActionResult ile HTTP cevabı döner (200 OK gibi)
        { // FromForm ile dışarıdan gelen form verisi tutulur
            if (username == "Emir Ata" && password == "12345")
            {
                return Ok(new { message = "Giriş başarılı." });
            }
            else
            {
                return Unauthorized(new { message = "Hatalı kullanıcı adı veya şifre." });
            }
        }
    }
}
