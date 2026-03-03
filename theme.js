// theme.js
// KovanTakip - Karanlık Mod Yönetimi (Dark Mode)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Temayı Kayıtlı Tercihten Oku
    const currentTheme = localStorage.getItem('kovanTakipTheme');

    // 2. Eğer özel bir seçim yoksa sistem tercihine bak
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Uygulanacak başlangıç teması
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        document.body.classList.add('dark-theme');
        updateThemeToggleUI(true);
    } else {
        document.body.classList.remove('dark-theme');
        updateThemeToggleUI(false);
    }

    // 3. Tema Değiştirme Butonu Dinleyicisi
    // Sayfada id'si "themeToggleBtn" olan bir buton ararız
    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');

    themeToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');

            let isDark = document.body.classList.contains('dark-theme');

            // Seçimi kaydet
            localStorage.setItem('kovanTakipTheme', isDark ? 'dark' : 'light');

            // Arayüzdeki tüm ikonları güncelle
            updateThemeToggleUI(isDark);
        });
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
