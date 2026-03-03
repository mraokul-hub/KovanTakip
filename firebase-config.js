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
})();
