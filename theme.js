// theme.js
// KovanTakip - Karanlık Mod Yönetimi (Dark Mode)

(function() {
    // Sayfa yüklenir yüklenmez temayı uygula (FOUC önlemek için)
    const savedTheme = localStorage.getItem('kovanTakipTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark-theme');
        // Body henüz hazır olmayabilir, DOMContentLoaded içinde body'ye de ekleyeceğiz
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    const isDark = document.documentElement.classList.contains('dark-theme') || 
                   localStorage.getItem('kovanTakipTheme') === 'dark';
    
    if (isDark) {
        document.body.classList.add('dark-theme');
        updateThemeToggleUI(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeToggleUI(false);
    }

    // Event Delegation: Dinamik olarak eklenen navbar'lar için de çalışır
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.theme-toggle-btn');
        if (btn) {
            document.body.classList.toggle('dark-theme');
            document.documentElement.classList.toggle('dark-theme');

            const isNowDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('kovanTakipTheme', isNowDark ? 'dark' : 'light');
            updateThemeToggleUI(isNowDark);
        }
    });
});

// Arayüzdeki (buton içindeki) ikonu güncelleyen fonksiyon
function updateThemeToggleUI(isDark) {
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach(icon => {
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// Ana Arı Yaşına Göre Uluslararası Renk Kodunu Döndüren Fonksiyon
window.getAnaAriRenk = function (dogumTarihi, manuelRenk) {
    let renkAdi = manuelRenk || "Boyasız";
    let cssRenk = "#ccc"; // Varsayılan Boyasız (Gri)

    if (dogumTarihi) {
        // Doğum tarihinden yılı al
        const yil = new Date(dogumTarihi).getFullYear();
        const sonRakam = yil % 10;

        if (sonRakam === 1 || sonRakam === 6) { renkAdi = "Beyaz"; cssRenk = "#ffffff"; }
        else if (sonRakam === 2 || sonRakam === 7) { renkAdi = "Sarı"; cssRenk = "#ffd700"; }
        else if (sonRakam === 3 || sonRakam === 8) { renkAdi = "Kırmızı"; cssRenk = "#ff2a2a"; }
        else if (sonRakam === 4 || sonRakam === 9) { renkAdi = "Yeşil"; cssRenk = "#00c853"; }
        else if (sonRakam === 5 || sonRakam === 0) { renkAdi = "Mavi"; cssRenk = "#2979ff"; }
    } else if (manuelRenk) {
        // Eğer tarih yok ama manuel renk girilmişse
        switch (manuelRenk.toLowerCase()) {
            case 'beyaz': cssRenk = "#ffffff"; break;
            case 'sarı': cssRenk = "#ffd700"; break;
            case 'kırmızı': cssRenk = "#ff2a2a"; break;
            case 'yeşil': cssRenk = "#00c853"; break;
            case 'mavi': cssRenk = "#2979ff"; break;
            default: cssRenk = "#ccc";
        }
    }

    // HTML Dairesi Döndür
    return `<span class="ana-renk-nokta" style="display:inline-block; width:12px; height:12px; border-radius:50%; background-color: ${cssRenk}; border:1px solid #777; vertical-align:middle; margin-right:4px;" title="${renkAdi} Ana"></span>`;
};

// Yeni Duyuru Kontrolü (Artık firebase-config.js içinde real-time olarak yapılıyor)
window.checkYeniDuyuru = function (db) {
    // Bu fonksiyon artık firebase-config.js içerisindeki onSnapshot tarafından otomatik yönetiliyor.
    // HTML sayfalarındaki eski çağrılar hata vermesin diye boş bırakılmıştır.
};

// Global Yardımcı Fonksiyonlar (Form Doğrulama ve Güvenlik İçin)
window.validateNumber = function(val, fallback = null) {
    if (val === null || val === undefined || val === '') return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
};

window.escapeHTML = function(str) {
    if (!str) return str;
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};
