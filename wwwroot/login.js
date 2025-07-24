document.getElementById("loginButton").addEventListener("click", async function () {
  const username = document.getElementById("username").value.trim();  // baş ve sondaki boşlukları siler
  const password = document.getElementById("password").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.textContent = "";

  if (!username || !password) {
    errorMsg.textContent = "Lütfen tüm alanları doldurun.";
    return;
  }

  const button = document.getElementById("loginButton");
  button.disabled = true;
  button.textContent = "Giriş yapılıyor...";

  try {
    const response = await fetch("http://localhost:5058/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      window.location.href = "rehber.html";
    } else {
      errorMsg.textContent = "Hatalı kullanıcı adı veya şifre";
    }
  } catch (err) {
    errorMsg.textContent = "Bir hata oluştu. Lütfen tekrar deneyin.";
  } finally {
    button.disabled = false;
    button.textContent = "Giriş";
  }
});

document.getElementById("toggleEye").addEventListener("click", function () {
  const password = document.getElementById("password");
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);

  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});
