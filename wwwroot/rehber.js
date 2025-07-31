let tumVeri = [];
let aktifSayfa = 1;
const kayitSayisi = 7;

// ✅ Silinecek kartın ID'sini almak için aktif veri listesini tut
let mevcutVeri = [];

// ✅ Sayfa yüklendiğinde yapılacaklar


document.addEventListener("DOMContentLoaded", () => {
  const btnProfil = document.getElementById("btnProfil");
  const btnRehber = document.getElementById("btnRehber");
  const userInfoPage = document.querySelector(".user-info-page");
  const rehberHeader = document.querySelector(".header");
  const cardHeader = document.querySelector(".card-header");
  const personelListesi = document.getElementById("personelListesi");
  const pagination = document.querySelector(".pagination");

  const modal = document.getElementById("modal");
  const openModalBtn = document.getElementById("openModalBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // ✅ Modal açma
  openModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // ✅ Modal kapama
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  // ✅ Modal dışına tıklanınca da kapansın
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  if (btnProfil && btnRehber) {
    btnProfil.addEventListener("click", () => {
      btnProfil.classList.add("active", "profile-shadow");
      btnRehber.classList.add("no-shadow");

      userInfoPage.style.display = "block";
      rehberHeader.style.display = "none";
      cardHeader.style.display = "none";
      personelListesi.style.display = "none";
      pagination.style.display = "none";
    });

    btnRehber.addEventListener("click", () => {
      btnRehber.classList.remove("no-shadow");
      btnProfil.classList.remove("profile-shadow", "active");

      userInfoPage.style.display = "none";
      rehberHeader.style.display = "flex";
      cardHeader.style.display = "grid";
      personelListesi.style.display = "grid";
      pagination.style.display = "flex";
    });
  }

  const token = localStorage.getItem("token");

  fetch("http://localhost:5058/api/rehber", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Yetkisiz erişim. Lütfen tekrar giriş yapın.");
      return res.json();
    })
    .then(data => {
      tumVeri = data;
      mevcutVeri = data;
      sayfayiGoster(1, tumVeri);
      sayfalariOlustur(tumVeri);

      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("keyup", () => {
        const keyword = searchInput.value.toLowerCase();
        const filtreli = tumVeri.filter(kisi =>
          kisi.isim.toLowerCase().includes(keyword) ||
          kisi.soyisim.toLowerCase().includes(keyword) ||
          kisi.firma.toLowerCase().includes(keyword) ||
          kisi.telefon.includes(keyword) ||
          kisi.id.toString().includes(keyword)
        );
        mevcutVeri = filtreli;
        sayfayiGoster(1, filtreli);
        sayfalariOlustur(filtreli);
      });
    })
    .catch(err => {
      alert(err.message);
      window.location.href = "login.html";
    });

  document.getElementById("kayitEkleButton").addEventListener("click", () => {
    const isim = document.getElementById("isimInput").value.trim();
    const soyisim = document.getElementById("soyisimInput").value.trim();
    const id = parseInt(document.getElementById("idInput").value.trim());
    const firma = document.getElementById("firmaInput").value.trim();
    const telefon = document.getElementById("telefonInput").value.trim();

    if (!isim || !soyisim || !firma || !telefon || isNaN(id)) {
      alert("Lütfen tüm alanları eksiksiz ve geçerli doldurun.");
      return;
    }

    fetch("http://localhost:5058/api/rehber", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ id, isim, soyisim, firma, telefon })
    })
      .then(res => {
        if (!res.ok) throw new Error("Kayıt başarısız.");
        return res.json();
      })
      .then(() => {
        const popupKayit = document.getElementById("popupKayit");
        if (popupKayit) {
          popupKayit.style.display = "none";
          popupKayit.style.animation = "none";
          popupKayit.offsetHeight;
          popupKayit.style.display = "block";
          popupKayit.style.animation = "fadeOut 3s forwards";
          setTimeout(() => {
            popupKayit.style.display = "none";
            modal.style.display = "none";
            location.reload();
          }, 3000);
        }
      })
      .catch(err => alert("Hata: " + err.message));
  });

  document.querySelector(".nav-button.logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  });

  document.querySelectorAll(".modal-content input").forEach(input => {
    input.addEventListener("focus", () => {
      document.querySelectorAll(".modal-content input").forEach(i => i.classList.remove("active-hover"));
      input.classList.add("active-hover");
    });
    input.addEventListener("blur", () => input.classList.remove("active-hover"));
  });

  const telefonInput = document.getElementById("telefonInput");
  telefonInput.addEventListener("focus", () => {
    if (telefonInput.value === "") telefonInput.value = "05";
  });

  telefonInput.addEventListener("input", () => {
    let value = telefonInput.value.replace(/\D/g, "");
    if (!value.startsWith("05")) value = "05";
    else value = value.slice(0, 11);
    telefonInput.value =
      value.length > 7
        ? `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`
        : value.length > 4
        ? `${value.slice(0, 4)} ${value.slice(4)}`
        : value;
  });

  const isimInput = document.getElementById("isimInput");
  const soyisimInput = document.getElementById("soyisimInput");
  [isimInput, soyisimInput].forEach(input => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[^a-zA-ZığüşöçİĞÜŞÖÇ\s]/g, "");
    });
  });

  const idInput = document.getElementById("idInput");
  idInput.addEventListener("keydown", e => {
    if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
  });

  // ✅✅✅ Buraya sıralama scriptini ekliyoruz
  let siralamaYonu = {
    isim: 'asc',
    soyisim: 'asc',
    firma: 'asc',
  };

  document.querySelectorAll(".sort-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      const kriter = icon.dataset.sort;
      const veriKopyasi = [...mevcutVeri];

      veriKopyasi.sort((a, b) => {
        let aDeger = a[kriter].toLowerCase();
        let bDeger = b[kriter].toLowerCase();

        if (siralamaYonu[kriter] === 'asc') {
          return aDeger.localeCompare(bDeger);
        } else {
          return bDeger.localeCompare(aDeger);
        }
      });

      siralamaYonu[kriter] = siralamaYonu[kriter] === 'asc' ? 'desc' : 'asc';
      tumVeri = veriKopyasi;
      sayfayiGoster(1, tumVeri);
      sayfalariOlustur(tumVeri);
    });
  });
});


function sayfayiGoster(sayfaNo, veri) {
  aktifSayfa = sayfaNo;
  const container = document.getElementById("personelListesi");
  container.innerHTML = "";

  const baslangic = (sayfaNo - 1) * kayitSayisi;
  const bitis = baslangic + kayitSayisi;
  const sayfaVerisi = veri.slice(baslangic, bitis);

  sayfaVerisi.forEach(kisi => {
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
      <div class="actions">
        <i class="fa fa-ellipsis-v"></i>
        <div class="dropdown-content" style="display: none; position: absolute;  padding: 5px; z-index: 10;">
          <button class="sil-btn">Sil</button>
        </div>
      </div>
    `;

    // ✅ Sil butonuna tıklandığında veritabanından ve DOM'dan kaldır
    card.querySelector(".sil-btn").addEventListener("click", () => {
      const token = localStorage.getItem("token");
      fetch(`http://localhost:5058/api/rehber/${kisi.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Silme başarısız.");
          return res.text();
        })
        .then(() => {
          tumVeri = tumVeri.filter(k => k.id !== kisi.id);
          sayfayiGoster(aktifSayfa, tumVeri);
          sayfalariOlustur(tumVeri);
        })
        .catch(err => alert("Hata: " + err.message));
    });

    // ✅ Üç nokta tıklandığında menüyü aç/kapat
    const ellipsis = card.querySelector(".fa-ellipsis-v");
    const dropdown = card.querySelector(".dropdown-content");
    ellipsis.addEventListener("click", (e) => {
      e.stopPropagation();

      // Önce tüm açık dropdown'ları kapat
      document.querySelectorAll(".dropdown-content").forEach(el => {
        el.style.display = "none";
      });

      // Sadece bu ellipsis'e ait olanı aç/kapat
      dropdown.style.display = "block";
    });


    document.body.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-content").forEach(el => {
        el.style.display = "none";
      });
    });


    container.appendChild(card);
  });

  const buttons = document.querySelectorAll(".pagination .page-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  if (buttons[sayfaNo - 1]) buttons[sayfaNo - 1].classList.add("active");
}

function sayfalariOlustur(veri) {
  const pagination = document.querySelector(".pagination");
  pagination.innerHTML = "";
  const toplamSayfa = Math.ceil(veri.length / kayitSayisi);

  for (let i = 1; i <= toplamSayfa; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "page-btn";
    if (i === aktifSayfa) btn.classList.add("active");
    btn.addEventListener("click", () => sayfayiGoster(i, veri));
    pagination.appendChild(btn);
  }

  const sonrakiBtn = document.createElement("button");
  sonrakiBtn.textContent = "Sonraki";
  sonrakiBtn.className = "page-btn";
  sonrakiBtn.addEventListener("click", () => {
    if (aktifSayfa < toplamSayfa) sayfayiGoster(aktifSayfa + 1, veri);
  });
  pagination.appendChild(sonrakiBtn);
}

document.querySelectorAll(".toggle-password").forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling;
    input.type = input.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  });
});

document.querySelector(".save-button").addEventListener("click", () => {
  const currentPassword = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("Yeni şifreler uyuşmuyor.");
    return;
  }

  const token = localStorage.getItem("token");

  fetch("http://localhost:5058/api/login/changepassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ currentPassword, newPassword })
  })
    .then(res => res.ok ? res.text() : res.text().then(msg => { throw new Error(msg); }))
    .then(msg => {
      const popup = document.getElementById("popupSuccess");
      if (popup) {
        popup.textContent = "Şifre başarıyla güncellendi";
        popup.style.display = "block";
        setTimeout(() => {
          popup.style.display = "none";
        }, 3000);
      }

      document.getElementById("currentPassword").value = "";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    })
    .catch(err => alert("Şifre güncellenemedi: " + err.message));
});

