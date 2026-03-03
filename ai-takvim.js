// ai-takvim.js
// Türkiye geneli bölgesel kovan yönetimi ve çiçeklenme/nektar akımı takvimi

const AITakvim = {
    "Marmara": {
        "iklim": "Ilıman ve geçiş iklimi",
        "baharUyanisi": "Mart ortası - Nisan başı",
        "anaNektar": ["Kestane (Haziran)", "Ayçiçeği (Temmuz)", "Ihlamur (Haziran sonu)", "Kanola (Nisan)"],
        "uyarilar": "Kış salkımı bozulmaları erken olabilir, açlık kontrolü önemlidir. Ayçiçeği sonrası varroa mücadelesi şarttır.",
        "takvim": {
            "Mart": "Erken ilkbahar teşviki, varroa kontrolü, zayıf kovanları daraltma.",
            "Nisan": "Kanola ve meyve ağaçları balı. Kuluçka gelişimi hızlanır, oğul kontrolüne başla.",
            "Mayıs": "Oğul mevsimi. Kat atma, çerçeve ilavesi. Ihlamur ve kestane öncesi güçlü kadro hazırlığı.",
            "Haziran": "Kestane ve Ihlamur nektar akımı. Ana nektar dönemi.",
            "Temmuz": "Ayçiçeği balı hasadı. Hasat sonrası varroa ilaçlaması.",
            "Ağustos": "Bal hasadı sonu. Kışlık arı yetiştirme teşvik beslemesi.",
            "Eylül": "Kışlık yiyecek stok kontrolü. Eksikse koyu şurup (2:1).",
            "Ekim": "Kışlama hazırlıkları, kovan daraltma, izolasyon.",
            "Kasım-Şubat": "Kış salkımı. Rahatsız edilmemeli. Acil durumda kek verilebilir."
        }
    },
    "Ege": {
        "iklim": "Akdeniz iklimi, sıcak ve kurak yazlar",
        "baharUyanisi": "Şubat sonu - Mart başı",
        "anaNektar": ["Çam (Ağustos - Kasım)", "Hayıt (Haziran)", "Narenciye (Nisan)"],
        "uyarilar": "Yaz aylarında aşırı sıcak nedeniyle kovan havalandırmasına dikkat edilmeli. Çam balı dönemi uzundur.",
        "takvim": {
            "Mart": "Narenciye nektarı başlar. Hızlı gelişim, ana arı ızgarası ve kat atma.",
            "Nisan": "Oğul riski yüksek. Narenciye balı hasadı yapılabilir.",
            "Mayıs": "Hayıt ve püren açar. Çam balına hazırlık için kadro yenileme.",
            "Haziran": "Sıcaklar başlar. Kovanlara su ve gölgelik sağlanmalı.",
            "Temmuz": "Çam basra böceği faaliyeti başlar.",
            "Ağustos": "Çam balı akımı başlar. Birinci sağım yapılabilir.",
            "Eylül": "Çam balı ikinci sağım. Varroa ilaçlaması (bal olmayan kovanlara).",
            "Ekim": "Çam balı son sağımı. Genç arı üretimi için besleme.",
            "Kasım": "Kış stoku tamamlama.",
            "Aralık-Şubat": "Ilıman geçtiği için arı tamamen salkıma girmeyebilir. Yiyecek tüketimi fazladır."
        }
    },
    "Akdeniz": {
        "iklim": "Sıcak Akdeniz iklimi",
        "baharUyanisi": "Şubat ortası",
        "anaNektar": ["Narenciye (Mart-Nisan)", "Harnup/Keçiboynuzu (Eylül)", "Çam (Eylül-Ekim)", "Kekik"],
        "uyarilar": "Yaz aylarında arılar yüksek rakımlı yaylalara taşınmalıdır (Göçer arıcılık).",
        "takvim": {
            "Şubat": "Erken uyanış. Badem ve meyve çiçekleri. Teşvik beslemesi.",
            "Mart": "Narenciye tomurcukları. Kat atma zamanı.",
            "Nisan": "Narenciye balı sağımı. Oğul önleme çalışmaları.",
            "Mayıs": "Ova aşırı ısınır, yaylaya (Toroslar) göç başlar.",
            "Haziran-Temmuz": "Yaylada kır çiçekleri ve sedir/köknar salgısı. Sedir balı sağımı.",
            "Ağustos": "Sahile/ovaya dönüş hazırlığı. Varroa mücadelesi.",
            "Eylül": "Keçiboynuzu ve Çam balı akımı.",
            "Ekim": "Sonbahar sağımları. Güçlü kışlatma için genç nüfus oluşturma.",
            "Kasım": "Kışlık yiyecek kontrolü.",
            "Aralık-Ocak": "Kısa kışlama dönemi. Acil besleme."
        }
    },
    "İç Anadolu": {
        "iklim": "Karasal iklim, soğuk kışlar, kurak yazlar",
        "baharUyanisi": "Nisan başı - ortası",
        "anaNektar": ["Kır Çiçekleri (Haziran-Temmuz)", "Korunga (Mayıs sonu)", "Geven (Temmuz)"],
        "uyarilar": "Kış kayıpları yüksek olabilir, iyi izolasyon şarttır. Nektar akımı süresi kısadır.",
        "takvim": {
            "Mart": "Kovan kapakları sadece sıcak günlerde açılır. Ölüm kontrolü, kek takviyesi.",
            "Nisan": "Bahar uyanışı. Teşvik şurubu (1:1). Daraltma çok önemlidir.",
            "Mayıs": "Meyve çiçekleri ve korunga. Gelişim hızlanır, oğul kontrolü.",
            "Haziran": "Ana nektar akımı (Geven, kır çiçekleri). Kat atma zamanı.",
            "Temmuz": "Bal hasadı başlar. Kuraklık artar, suya ihtiyaç duyarlar.",
            "Ağustos": "Hasat biter. Derhal varroa mücadelesi. Şurup ile yavru teşviki.",
            "Eylül": "Kışlık yoğun şurup (2:1) beslemesi tamamlanmalı.",
            "Ekim": "Sıkıştırma, izolasyon (çuvallama), fare siperlikleri takılır.",
            "Kasım-Şubat": "Tam kış salkımı. Kovan asla açılmaz."
        }
    },
    "Karadeniz": {
        "iklim": "Her mevsim yağışlı, ılıman",
        "baharUyanisi": "Mart sonu",
        "anaNektar": ["Kestane (Haziran)", "Orman Gülü/Kamar (Mayıs)", "Orman Salgısı", "Fındık Poleni (Erken Bahar)"],
        "uyarilar": "Kestane balında acı bal (orman gülü) karışımı riski vardır. Sürekli yağış arının uçuşunu engeller, açlık yapabilir.",
        "takvim": {
            "Mart": "Fındık püsküllerinden ilk polen gelir. Teşvik beslemesi.",
            "Nisan": "Meyve çiçekleri. Gelişim dengeli olmalı, yağışlı günlerde şurup verilmeli.",
            "Mayıs": "Orman gülü (Deli bal) açar. Oğul eğilimi. Kestane öncesi güçlü kadro kurulur.",
            "Haziran": "Kestane ve Ihlamur balı nektar akımı. (Kısa sürer, hava iyi olmalıdır).",
            "Temmuz": "Kestane balı sağımı. Varroa ilacı ve yaylaya (yüksek rakıma) göç.",
            "Ağustos": "Yayla kır çiçekleri. Hasat sonrası bakım.",
            "Eylül": "Kışlık hazırlık. Yağışlar artar.",
            "Ekim": "Kovan içi nemi önleyici önlemler (havalandırma delikleri) çok önemlidir.",
            "Kasım-Şubat": "Kış salkımı."
        }
    },
    "Doğu Anadolu": {
        "iklim": "Sert Karasal, uzun ve çok soğuk kışlar",
        "baharUyanisi": "Nisan sonu - Mayıs başı",
        "anaNektar": ["Yüksek Yayla Kır Çiçekleri (Temmuz-Ağustos)", "Geven (Temmuz)"],
        "uyarilar": "Kışlatma 6-7 ay sürebilir. Arılar salkımda uzun kalır. İlkbahar Nosema riski yüksektir.",
        "takvim": {
            "Mart-Nisan": "Hala kış. Çıkışlar gecikir. Kek verilebilir. Kapak açarken çok dikkatli olunmalı.",
            "Mayıs": "Hızlı bahar uyanışı. Çiçeklenme birden başlar. Şurup teşviki ve teşvik edici besleme.",
            "Haziran": "Kadro çok hızlı büyür. Oğul sezonu kısadır.",
            "Temmuz": "Ana nektar dönemi (Geven). Çok yoğun akım olur.",
            "Ağustos": "Bal sağımı. Hemen ardından çok hızlı kışa hazırlık ve varroa mücadelesi başlar.",
            "Eylül": "Kışlık besleme bitirilmeli (2:1 şurup). Geceler don yapar.",
            "Ekim": "Kar yağmadan izolasyon tamamlanmalı. Kovanlar rüzgar almayan yerlere alınmalı.",
            "Kasım-Mart": "Derin kış salkımı."
        }
    },
    "Güneydoğu Anadolu": {
        "iklim": "Karasal, yazları aşırı sıcak ve kurak",
        "baharUyanisi": "Mart başı",
        "anaNektar": ["Pamuk (Ağustos)", "Badem (Şubat-Mart)", "Günebakan"],
        "uyarilar": "Yaz aylarındaki aşırı sıcak (40°C+) mum erimelerine neden olabilir. Gölgelik zorunludur. Tarımsal ilaçlama riski çok yüksektir.",
        "takvim": {
            "Şubat": "Badem çiçekleri ile çok erken uyanış.",
            "Mart": "Meyve çiçekleri, hızlı gelişim.",
            "Nisan": "Bahar balı alınabilir. Sıcaklar erken başlar.",
            "Mayıs": "Kuraklık başlar. Yaylaya (Doğuya doğru) göç başlar.",
            "Haziran-Temmuz": "Aşırı sıcaklar. Kovanlara mutlaka temiz su verilmeli. Gölgelik altında olmalı.",
            "Ağustos": "Pamuk ve ayçiçeği için ovalarda nektar akımı.",
            "Eylül": "Sağım ve sonbahar bakımı.",
            "Ekim": "Genç nüfus oluşturma teşviki.",
            "Kasım-Aralık": "Yumuşak kışlama."
        }
    }
};

window.AITakvim = AITakvim;
