// firebase-config.js
// KovanTakip — Ortak Firebase Başlatma Dosyası
// Bu dosyayı tüm HTML sayfalarında firebase SDK'larından SONRA yükleyin.

(function () {
    const firebaseConfig = {
        apiKey: "AIzaSyAO7203PN7V8IBxYe0B13iRy0Ahwzm5sXY",
        authDomain: "kovan-takip-4c054.firebaseapp.com",
        projectId: "kovan-takip-4c054",
        storageBucket: "kovan-takip-4c054.appspot.com",
        messagingSenderId: "783431210365",
        appId: "1:783431210365:web:5810ec74c9ff3ba8d4a814"
    };

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const db = firebase.firestore();

    // Çevrimdışı Veri Kaydetme Özelliğini Etkinleştir
    db.enablePersistence({ synchronizeTabs: true })
        .catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn("Çevrimdışı persistence sadece bir sekmede aktif olabilir.");
            } else if (err.code == 'unimplemented') {
                console.warn("Tarayıcı çevrimdışı persistence desteklemiyor.");
            }
        });

    // Global Yeni Duyuru Takibi (Tüm Sayfalar İçin)
    db.collection("pano").orderBy("eklenmeTarihi", "desc").limit(1).onSnapshot(snap => {
        if (!snap.empty) {
            const docData = snap.docs[0].data();
            if (!docData.eklenmeTarihi) return;

            const sonDuyuruZamani = docData.eklenmeTarihi.toDate().getTime();
            const sonGorulenZaman = localStorage.getItem("sonDuyuruGormeZamani");

            const updateNotificationUI = () => {
                const btns = document.querySelectorAll('#duyuruBtn, #duyuruBtnMobile, .duyuru-btn');
                if (!sonGorulenZaman || sonDuyuruZamani > parseInt(sonGorulenZaman)) {
                    btns.forEach(btn => btn.classList.add('has-new'));
                } else {
                    btns.forEach(btn => btn.classList.remove('has-new'));
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', updateNotificationUI);
            } else {
                updateNotificationUI();
            }
        }
    }, err => {
        console.log("Duyuru takibi çevrimdışıyken duraklatıldı veya hata oluştu.");
    });

    // İnternet Bağlantı Durumu Takibi ve Bildirim UI
    const setupOfflineUI = () => {
        const style = document.createElement('style');
        style.textContent = `
            .offline-notification {
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 10000;
                padding: 12px 24px;
                border-radius: 50px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-weight: 600;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                opacity: 0;
                pointer-events: none;
            }
            .offline-notification.show {
                opacity: 1;
                pointer-events: auto;
                bottom: 100px;
            }
            .offline-notification.offline {
                background: #ef4444;
                color: white;
            }
            .offline-notification.online {
                background: #10b981;
                color: white;
            }
            @media (max-width: 768px) {
                .offline-notification {
                    width: 90%;
                    bottom: 70px;
                }
            }
        `;
        document.head.appendChild(style);

        const notifyEl = document.createElement('div');
        notifyEl.className = 'offline-notification';
        document.body.appendChild(notifyEl);

        const showNotification = (isOnline) => {
            notifyEl.className = `offline-notification show ${isOnline ? 'online' : 'offline'}`;
            notifyEl.innerHTML = isOnline 
                ? '<i class="fa-solid fa-cloud-arrow-up"></i> İnternet Geldi! Veriler Aktarılıyor...'
                : '<i class="fa-solid fa-cloud-slash"></i> İnternet Yok. Kayıtlar Cihaza Yapılacak.';
            
            if (isOnline) {
                setTimeout(() => {
                    notifyEl.classList.remove('show');
                }, 3000);
            }
        };

        window.addEventListener('online', () => showNotification(true));
        window.addEventListener('offline', () => showNotification(false));

        // Başlangıç kontrolü
        if (!navigator.onLine) {
            showNotification(false);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupOfflineUI);
    } else {
        setupOfflineUI();
    }

})();
