document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  fetch("http://localhost:5058/api/rehber", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Yetkisiz erişim. Lütfen tekrar giriş yapın.");
      }
      return response.json();
    })
    .then(data => {
      const container = document.getElementById("personelListesi");
      container.innerHTML = "";

      data.forEach(kisi => {
        const initials = (kisi.isim[0] + kisi.soyisim[0]).toUpperCase();
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <div class="field isim">
            <div class="initials">${initials}</div>
            <div class="text">${kisi.isim}</div>
          </div>
          <div class="field soyisim">${kisi.soyisim}</div>
          <div class="field id">${kisi.id}</div>
          <div class="field firma">${kisi.firma}</div>
          <div class="field telefon">${kisi.telefon}</div>
          <div class="actions"><i class="fa fa-ellipsis-v"></i></div>
        `;
        container.appendChild(card);
      });

      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("keyup", function () {
        const keyword = this.value.toLowerCase();
        const cards = container.querySelectorAll(".card");
        cards.forEach(card => {
          const text = card.textContent.toLowerCase();
          card.style.display = text.includes(keyword) ? "" : "none";
        });
      });
    })
    .catch(error => {
      alert(error.message);
      window.location.href = "login.html";
    });
});
