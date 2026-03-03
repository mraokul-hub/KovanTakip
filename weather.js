// weather.js

function getKovanGruplari() {
    try {
        const data = localStorage.getItem('kovan_gruplari');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

function saveKovanGruplari(arr) {
    localStorage.setItem('kovan_gruplari', JSON.stringify(arr));
}

function getAktifGrupId() {
    return localStorage.getItem('kovan_aktif_grup_id');
}

function setAktifGrupId(id) {
    localStorage.setItem('kovan_aktif_grup_id', id);
}

function showBolgeModal() {
    new bootstrap.Modal(document.getElementById('bolgeModal')).show();
    setTimeout(populateBolgeModalKovanlar, 300);
}

async function populateBolgeModalKovanlar() {
    const listElement = document.getElementById('bolgeModalKovanListesi');
    if (!listElement) return;

    listElement.innerHTML = '<div class="text-center py-2"><div class="spinner-border spinner-border-sm text-primary"></div> Kovanlar yükleniyor...</div>';
    try {
        const uid = localStorage.getItem('kovan_uid') || (firebase.auth().currentUser ? firebase.auth().currentUser.uid : null);
        if (!uid) { listElement.innerHTML = '<div class="text-muted small">Kovanları getirmek için oturum açmalısınız.</div>'; return; }

        const db = firebase.firestore();
        const snap = await db.collection("kullanicilar").doc(uid).collection("kovanlar").get();

        if (snap.empty) {
            listElement.innerHTML = '<div class="text-muted small">Henüz aktif kovanınız bulunmuyor.</div>';
            return;
        }

        let kovanlar = [];
        snap.forEach(doc => kovanlar.push({ id: doc.id, data: doc.data() }));
        kovanlar.sort((a, b) => (a.data.no || '').localeCompare(b.data.no || '', undefined, { numeric: true }));

        let html = '';
        kovanlar.forEach(k => {
            html += `
            <div class="form-check mb-2 border-bottom pb-2">
                <input class="form-check-input bolge-kovan-cb cursor-pointer" type="checkbox" value="${k.id}" id="cb_bolge_${k.id}">
                <label class="form-check-label ms-2 cursor-pointer w-100" for="cb_bolge_${k.id}">
                    <span class="fw-bold text-dark">Kovan: ${k.data.no || '?'}</span> 
                    <span class="text-muted small ms-2">${k.data.tip || ''} ${k.data.irk || ''}</span>
                    ${k.data.bolgeGrupAdi ? `<span class="badge bg-secondary ms-2 small">Şu an: ${k.data.bolgeGrupAdi}</span>` : ''}
                </label>
            </div>`;
        });

        listElement.innerHTML = html;
    } catch (e) {
        listElement.innerHTML = '<div class="text-danger small">Hata: ' + e.message + '</div>';
    }
}

async function kaydetVeGetir() {
    const grupAdiEl = document.getElementById('secGrupAdi');
    const grupAdi = (grupAdiEl ? grupAdiEl.value.trim() : '') || 'Ana Arılık';
    const bolge = document.getElementById('secBolge').value;
    const sehir = document.getElementById('secSehir').value.trim();
    if (!sehir) { alert("Lütfen bir şehir adı girin."); return; }

    const btn = document.querySelector('#bolgeModal .btn-primary');
    const oldText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Bekleyin...';
    btn.disabled = true;

    try {
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${sehir}&count=1&language=tr&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("Şehir bulunamadı, lütfen geçerli bir il veya ilçe girin.");
            btn.innerHTML = oldText; btn.disabled = false;
            return;
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const eSehir = geoData.results[0].name;

        let gruplar = getKovanGruplari();
        const newId = Date.now().toString();

        gruplar.push({
            id: newId,
            grupAdi: grupAdi,
            sehir: eSehir,
            bolge: bolge,
            lat: lat,
            lon: lon
        });

        saveKovanGruplari(gruplar);
        setAktifGrupId(newId);

        // Firebase kovanlarını güncelle
        const uid = firebase.auth()?.currentUser?.uid;
        const selectedKovanIds = Array.from(document.querySelectorAll('.bolge-kovan-cb:checked')).map(cb => cb.value);

        if (uid && selectedKovanIds.length > 0) {
            const db = firebase.firestore();
            const batch = db.batch();
            selectedKovanIds.forEach(kId => {
                const ref = db.collection("kullanicilar").doc(uid).collection("kovanlar").doc(kId);
                batch.update(ref, {
                    bolgeGrupId: newId,
                    bolgeGrupAdi: grupAdi
                });
            });
            await batch.commit();
            console.log("Kovanlar güncellendi.");
        }

        bootstrap.Modal.getInstance(document.getElementById('bolgeModal')).hide();
        loadHavaDurumu();

        // Ana sayfadaysak veya Kovanlarım sayfasındaysak kovanları yeniden yükle
        if (typeof kovanlariYukle === 'function' && uid) {
            kovanlariYukle(uid);
        }

        // Formu temizle
        if (grupAdiEl) grupAdiEl.value = '';
        document.getElementById('secSehir').value = '';

        btn.innerHTML = oldText; btn.disabled = false;
    } catch (e) {
        alert("Bağlantı hatası: " + e.message);
        btn.innerHTML = oldText; btn.disabled = false;
    }
}

function grupDegistir(selectEl) {
    const newVal = selectEl.value;
    if (newVal === 'yeni_ekle') {
        selectEl.value = getAktifGrupId();
        showBolgeModal();
    } else {
        setAktifGrupId(newVal);
        loadHavaDurumu();
    }
}

async function loadHavaDurumu() {
    const kart = document.getElementById('havaDurumuKarti');
    if (!kart) return;

    let gruplar = getKovanGruplari();

    // Eski sistemden kalma veri varsa onu bir gruba dönüştürüp array'e alalım (Migration)
    if (gruplar.length === 0 && localStorage.getItem('kovan_lat')) {
        const oldLat = localStorage.getItem('kovan_lat');
        const oldLon = localStorage.getItem('kovan_lon');
        const oldSehir = localStorage.getItem('kovan_sehir');
        const oldBolge = localStorage.getItem('kovan_bolge');

        const migId = Date.now().toString();
        gruplar.push({
            id: migId,
            grupAdi: 'Ana Arılık (Varsayılan)',
            sehir: oldSehir,
            bolge: oldBolge,
            lat: oldLat,
            lon: oldLon
        });
        saveKovanGruplari(gruplar);
        setAktifGrupId(migId);

        // Kaldır eski localstorage verilerini temizlik amaçlı
        localStorage.removeItem('kovan_lat');
        localStorage.removeItem('kovan_lon');
        localStorage.removeItem('kovan_sehir');
        localStorage.removeItem('kovan_bolge');
    }

    if (gruplar.length === 0) {
        kart.innerHTML = `
            <div class="text-center py-3">
                <h5 class="fw-bold text-primary mb-3"><i class="fa-solid fa-cloud-sun me-2"></i>Bölge Seçimi ve Hava Durumu</h5>
                <p class="text-muted small">Kovanlığınızın bulunduğu bölgeyi seçerek size özel 5 günlük arıcılık hava durumu ve yapay zeka takvimini aktive edin.</p>
                <button class="btn btn-primary rounded-pill px-4 fw-bold" onclick="showBolgeModal()">Bölge Seçimi Yap</button>
            </div>
        `;
        return;
    }

    let aktifId = getAktifGrupId();
    let aktifGrup = gruplar.find(g => g.id === aktifId);

    if (!aktifGrup) {
        aktifGrup = gruplar[0]; // fallback
        setAktifGrupId(aktifGrup.id);
        aktifId = aktifGrup.id;
    }

    kart.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div><div class="mt-2 fw-bold text-muted">${aktifGrup.sehir} hava durumu alınıyor...</div></div>`;

    try {
        const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${aktifGrup.lat}&longitude=${aktifGrup.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto`);
        const wData = await wRes.json();

        let optionsHtml = gruplar.map(g => `<option value="${g.id}" ${g.id === aktifId ? 'selected' : ''}>${g.grupAdi} (${g.sehir})</option>`).join('');
        optionsHtml += `<option value="yeni_ekle">+ Yeni Grup Ekle...</option>`;

        let html = `<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div class="d-flex align-items-center flex-grow-1">
                            <i class="fa-solid fa-location-dot text-danger me-2 fs-5"></i>
                            <select class="form-select border-0 bg-transparent fw-bold text-dark fs-5 p-0 pe-4 shadow-none cursor-pointer" style="cursor: pointer; text-overflow: ellipsis; max-width: 100%;" onchange="grupDegistir(this)">
                                ${optionsHtml}
                            </select>
                        </div>
                        <div class="d-flex gap-1 justify-content-end">
                            <button class="btn btn-sm btn-outline-primary fw-bold" onclick="showAITakvim()"><i class="fa-solid fa-brain me-1"></i>AI Takvim</button>
                            <button class="btn btn-sm btn-light" onclick="grupSil()"><i class="fa-solid fa-trash text-danger"></i></button>
                        </div>
                    </div><div class="row row-cols-2 row-cols-md-5 g-2">`;

        const d = wData.daily;
        const today = new Date();

        for (let i = 0; i < 5; i++) {
            const dateStr = d.time[i]; // YYYY-MM-DD
            const [y, m, day] = dateStr.split('-');
            const tDate = new Date(y, m - 1, day);
            const isToday = i === 0;
            const dayName = tDate.toLocaleDateString('tr-TR', { weekday: 'short' });
            const tMax = Math.round(d.temperature_2m_max[i]);
            const tMin = Math.round(d.temperature_2m_min[i]);
            const wind = Math.round(d.windspeed_10m_max[i]);

            // Kapak açmaya uygunluk: Max sıcaklık 15+ üstü, Rüzgar 25km/h altı
            const uygun = tMax >= 15 && wind < 25;
            const bColor = uygun ? 'border-success' : 'border-danger';
            const iconColor = uygun ? 'text-success' : 'text-danger';
            const durumText = uygun ? 'Uygun' : 'Uygun Değil';

            html += `
            <div class="col">
                <div class="card h-100 ${bColor} shadow-sm text-center" style="border-width: 2px;">
                    <div class="card-header p-1 bg-transparent fw-bold small ${isToday ? 'text-primary' : ''}">${isToday ? 'Bugün' : dayName}</div>
                    <div class="card-body p-2">
                        <h4 class="fw-bold mb-0 ${iconColor}">${tMax}°</h4>
                        <div class="small text-muted mb-1">${tMin}° / <i class="fa-solid fa-wind"></i> ${wind}</div>
                        <span class="badge ${uygun ? 'bg-success' : 'bg-danger'} w-100" style="font-size: 0.7rem;">${durumText}</span>
                    </div>
                </div>
            </div>`;
        }

        html += `</div>`;
        kart.innerHTML = html;

    } catch (e) {
        kart.innerHTML = `<div class="text-center text-danger fw-bold py-3"><i class="fa-solid fa-triangle-exclamation me-2"></i>Hava durumu alınamadı. İnternet bağ. kontrol edin. <button class="btn btn-sm btn-outline-danger ms-2" onclick="loadHavaDurumu()">Tekrar Dene</button></div>`;
    }
}

function grupSil() {
    if (!confirm("Bu hava durumu grubunu silmek istediğinize emin misiniz?")) return;

    const aktifId = getAktifGrupId();
    let gruplar = getKovanGruplari();
    gruplar = gruplar.filter(g => g.id !== aktifId);
    saveKovanGruplari(gruplar);

    if (gruplar.length > 0) {
        setAktifGrupId(gruplar[0].id);
    } else {
        localStorage.removeItem('kovan_aktif_grup_id');
    }

    loadHavaDurumu();
}

function showAITakvim() {
    const gruplar = getKovanGruplari();
    const aktifId = getAktifGrupId();
    const aktifGrup = gruplar.find(g => g.id === aktifId);

    if (!aktifGrup) return;

    const bolge = aktifGrup.bolge;
    if (!window.AITakvim || !window.AITakvim[bolge]) {
        alert("Takvim verisi bulunamadı.");
        return;
    }
    const data = window.AITakvim[bolge];

    let html = `
        <div class="alert alert-info py-2"><strong><i class="fa-solid fa-cloud-sun me-2"></i>İklim:</strong> ${data.iklim}</div>
        <div class="alert alert-success py-2"><strong><i class="fa-solid fa-leaf me-2"></i>Bahar:</strong> ${data.baharUyanisi}</div>
        <div class="alert alert-warning py-2"><strong><i class="fa-solid fa-droplet me-2"></i>Akım:</strong> ${data.anaNektar.join(', ')}</div>
        <h6 class="fw-bold text-danger mt-3"><i class="fa-solid fa-circle-exclamation me-2"></i>Uyarılar</h6>
        <p class="text-muted border-start border-3 border-danger ps-2 small">${data.uyarilar}</p>
        <hr>
        <h6 class="fw-bold text-primary mt-3"><i class="fa-solid fa-calendar-days me-2"></i>Arıcılık Takvimi (${aktifGrup.grupAdi})</h6>
        <div class="list-group list-group-flush mt-2">
    `;

    for (const [ay, islem] of Object.entries(data.takvim)) {
        html += `
            <div class="list-group-item d-flex align-items-start px-0 py-2">
                <div class="fw-bold text-dark me-2" style="min-width: 75px;">${ay}:</div>
                <div class="text-muted small">${islem}</div>
            </div>
        `;
    }

    html += `</div>`;
    document.getElementById('aiTakvimBody').innerHTML = html;
    new bootstrap.Modal(document.getElementById('aiTakvimModal')).show();
}

// Global page load hook
document.addEventListener('DOMContentLoaded', () => {
    // We only call loadHavaDurumu on elements that have the card
    if (document.getElementById('havaDurumuKarti')) {
        loadHavaDurumu();
    }
});
