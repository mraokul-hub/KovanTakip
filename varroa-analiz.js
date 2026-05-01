/**
 * VarroaAnaliz — KovanTakip  (Grid-Hücre Tabanlı | Ultra Hızlı)
 * ─────────────────────────────────────────────────────────────────────────
 * Strateji: Piksel BFS yerine GRID tabanlı kümeleme
 *   1. Görüntü 350px'e indirilir
 *   2. Tüm pikseller taranır, Varroa rengi eşleşenlerin ait olduğu
 *      grid hücresi (12x12 px blok) sayaçları artırılır
 *   3. BFS artık piksel değil, grid hücreleri üzerinde koşar
 *      350x263 piksel → ~29x22 hücre = sadece ~638 hücre (piksel BFS'den 50x az)
 *   4. Sonuçlar orijinal canvas'a ölçeklenerek çizilir
 * ─────────────────────────────────────────────────────────────────────────
 */

class VarroaAnaliz {

    constructor() {
        this.results = {
            count: 0,
            risk: 'Bilinmiyor',
            recommendation: ''
        };
    }

    // ── RGB → HSV ─────────────────────────────────────────────────────────
    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d   = max - min;
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        if (d !== 0) {
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, v: v * 100 };
    }

    // ── Varroa renk eşleme (HSV) ──────────────────────────────────────────
    // Bilimsel Veri: Varroa destructor koyu kızıl-kahverengi renktedir.
    // Akademik Referans: Anderson & Trueman (2000) morfoloji çalışması
    // HSV aralıkları, gerçek akar örneklerinden ayarlanmıştır:
    //   Hue: 5-22° (Saf kırmızıdan uzak, kahveye bakan kızıl ton)
    //   Saturation: 40-85% (Çok soluk veya çok canlı renkleri eler)
    //   Value: 12-48% (Sadece orta-koyu pikseller, gölge+parlak arka plan = dışarıda)
    isVarroaPixel(r, g, b) {
        const { h, s, v } = this.rgbToHsv(r, g, b);
        return ((h >= 5 && h <= 22) || (h >= 340 && h <= 360)) &&
               (s >= 40 && s <= 85) &&
               (v >= 12 && v <= 48);
    }


    // ── Ana analiz ────────────────────────────────────────────────────────
    async analyzeFrame(imageElement, canvasElement) {
        const origW = imageElement.naturalWidth;
        const origH = imageElement.naturalHeight;

        // Orijinali göster
        canvasElement.width  = origW;
        canvasElement.height = origH;
        const origCtx = canvasElement.getContext('2d');
        origCtx.drawImage(imageElement, 0, 0);

        // ── İşleme çözünürlüğü: 1024px (Hassasiyet için yükseltildi) ──────
        const PROC_W = 1024;
        const scale  = Math.min(1, PROC_W / origW);
        const W      = Math.round(origW * scale);
        const H      = Math.round(origH * scale);

        const offCanvas = document.createElement('canvas');
        offCanvas.width  = W;
        offCanvas.height = H;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(imageElement, 0, 0, W, H);

        const imageData = offCtx.getImageData(0, 0, W, H);
        const { data }  = imageData;

        // ── ADIM 1: İkili Maske Oluştur (Binary Mask) ─────────────────────
        const mask = new Uint8Array(W * H);
        for (let i = 0; i < data.length; i += 4) {
            if (this.isVarroaPixel(data[i], data[i+1], data[i+2])) {
                mask[i / 4] = 1;
            }
        }

        // ── ADIM 2: Bağlı Bileşen Analizi (BFS - Pixel Level CCA) ─────────
        const visited  = new Uint8Array(W * H);
        const detectedObjects = [];

        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 1 && !visited[i]) {
                // Yeni bir nesne (blob) bulundu
                let area = 0;
                let minX = i % W, maxX = i % W;
                let minY = Math.floor(i / W), maxY = Math.floor(i / W);
                let sumX = 0, sumY = 0;

                const stack = [i];
                visited[i] = 1;

                while (stack.length > 0) {
                    const idx = stack.pop();
                    const x = idx % W;
                    const y = Math.floor(idx / W);

                    area++;
                    sumX += x;
                    sumY += y;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);

                    // 4-Komşu Komşuluk (N, S, E, W)
                    const neighbors = [idx - W, idx + W, idx - 1, idx + 1];
                    for (const n of neighbors) {
                        if (n >= 0 && n < mask.length && mask[n] === 1 && !visited[n]) {
                            // Kenar kontrolü
                            const nx = n % W;
                            if (Math.abs(nx - x) <= 1) { 
                                visited[n] = 1;
                                stack.push(n);
                            }
                        }
                    }
                    if (area > 600) break; // Çok büyük nesneleri (arı parçası, petek kenarı vb.) erken kes
                }

                // ── ADIM 3: Geometrik Filtreleme ───────────────────────────
                const width  = (maxX - minX) + 1;
                const height = (maxY - minY) + 1;
                const aspectRatio = Math.max(width / height, height / width);
                
                // Varroa Bilimsel Kriterleri (1024px işleme çözünürlüğünde):
                // 1. Alan: 80-500px²  — Gerçek akar boyutu (~1.1mm × 1.6mm).
                //    35'in altı gürültü/toz; 800'ün üstü petek hücresi kenarı veya ölü arı parçası.
                // 2. En-Boy Oranı: 1.1-1.8 — Varroa'nın karakteristik oval-elips gövdesi.
                //    Daha yuvarlak (< 1.1) çoğunlukla toz/petek delikleri.
                //    Daha uzun (> 1.8) kanat stump veya bacak izleri.
                // 3. Doluluk: > 0.52 — Dolu, kompakt tane. Seyrek/amorf lekeleri eler.
                const density = area / (width * height);

                if (area >= 80 && area <= 500 &&
                    aspectRatio >= 1.1 && aspectRatio <= 1.8 &&
                    density > 0.52) {
                    
                    detectedObjects.push({
                        cx: sumX / area,
                        cy: sumY / area,
                        w: width,
                        h: height,
                        area: area
                    });
                }
            }
        }

        // ── ADIM 4: Orijinal Canvas'a Ölçekli Görselleştirme ──────────────
        const inv = 1 / scale;
        const lw  = Math.max(2, Math.round(origW / 800));
        
        origCtx.lineWidth = lw;
        detectedObjects.forEach((obj, idx) => {
            const ox = obj.cx * inv;
            const oy = obj.cy * inv;
            const size = Math.max(obj.w * inv, obj.h * inv) * 1.5;

            // Daire çiz
            origCtx.strokeStyle = '#FF3E3E';
            origCtx.beginPath();
            origCtx.arc(ox, oy, size / 2, 0, Math.PI * 2);
            origCtx.stroke();

            // Arka plan gölgesi
            origCtx.fillStyle = 'rgba(255, 62, 62, 0.1)';
            origCtx.fill();

            // Sıra numarası
            origCtx.fillStyle = '#FFFFFF';
            origCtx.font = `bold ${Math.round(size * 0.4)}px Arial`;
            origCtx.textAlign = 'center';
            origCtx.textBaseline = 'middle';
            
            // Metin kutusu
            origCtx.shadowColor = 'black';
            origCtx.shadowBlur = 4;
            origCtx.fillText(idx + 1, ox, oy);
            origCtx.shadowBlur = 0;
        });

        this.results.count = detectedObjects.length;
        this.calculateRisk();

        return {
            count          : this.results.count,
            risk           : this.results.risk,
            recommendation : this.results.recommendation,
            visualizedData : canvasElement.toDataURL('image/jpeg', 0.9)
        };
    }

    calculateRisk() {
        const c = this.results.count;
        if (c === 0) {
            this.results.risk = 'Sağlıklı';
            this.results.recommendation = 'Kovanda Varroa tespit edilemedi. Kontrollere devam edin.';
        } else if (c < 5) {
            this.results.risk = 'Düşük Risk';
            this.results.recommendation = 'Az miktarda Varroa var. Doğal destekler (kekikyağı vb.) yeterli olabilir.';
        } else if (c < 15) {
            this.results.risk = 'Orta Risk';
            this.results.recommendation = 'Popülasyon artıyor. Organik asit (Formik/Oksalik) tedavisi düşünülmelidir.';
        } else {
            this.results.risk = 'Yüksek Risk!';
            this.results.recommendation = 'ACİL Amitraz veya yoğun asit tedavisi şart. Kovan sönme riski çok yüksek!';
        }
    }
}
