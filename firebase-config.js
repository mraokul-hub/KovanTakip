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

    // Global Yeni Duyuru Takibi (Tüm Sayfalar İçin)
    const db = firebase.firestore();
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
    });
})();
