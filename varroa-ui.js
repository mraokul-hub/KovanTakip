// varroa-ui.js
// UI logic for Varroa AI analysis modal
// Handles file selection, model loading, inference, drawing results, and UI updates.

import { getVarroaModel, warmupVarroaModel } from './varroa-model-loader.js';
import { detectVarroaInImage } from './varroa-detector.js';

// Risk thresholds (same as backend logic)
const riskLevels = [
  { max: 0, label: 'Sağlıklı', color: 'success', recommendation: 'Kovanda Varroa tespit edilemedi. Kontrollere devam edin.', load: 'Yok' },
  { max: 4, label: 'Düşük Risk', color: 'warning', recommendation: 'Az miktarda Varroa var. Doğal destekler (kekik yağı vb.) yeterli olabilir.', load: 'Az' },
  { max: 14, label: 'Orta Risk', color: 'danger', recommendation: 'Popülasyon artıyor. Organik asit (Formik/Oksalik) tedavisi düşünülmelidir.', load: 'Orta' },
  { max: Infinity, label: 'Yüksek Risk!', color: 'danger', recommendation: 'ACİL Amitraz veya yoğun asit tedavisi şart. Kovan sönme riski çok yüksek!', load: 'Çok' }
];

let lastAnalysisResult = null;

/**
 * Determine risk level based on mite count.
 */
function getRiskInfo(count) {
  for (const level of riskLevels) {
    if (count <= level.max) {
      return level;
    }
  }
  return riskLevels[riskLevels.length - 1];
}

/**
 * Draw detections on the provided canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {Array} detections - objects {x, y, width, height, score}
 */
function drawDetections(canvas, detections) {
  const ctx = canvas.getContext('2d');
  // Clear previous drawings
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  detections.forEach((det, idx) => {
    const { x, y, width, height } = det;
    // Draw semi‑transparent fill
    ctx.fillStyle = 'rgba(255, 62, 62, 0.1)';
    ctx.fillRect(x, y, width, height);
    // Stroke with glass‑like border
    ctx.strokeStyle = '#FF3E3E';
    ctx.lineWidth = Math.max(3, Math.round(canvas.width / 300));
    ctx.strokeRect(x, y, width, height);
    // Number label
    ctx.fillStyle = '#FFFFFF';
    const fontSize = Math.max(24, Math.round(canvas.width / 30));
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.fillText(idx + 1, x + width / 2, y + height / 2);
    ctx.shadowBlur = 0;
  });
}

/**
 * Handle file input change for Varroa photo upload.
 * @param {HTMLInputElement} input
 */
window.handleVarroaPhoto = async function (input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const img = new Image();
  img.onload = async () => {
    // Switch UI steps
    document.getElementById('varroaUploadStep').classList.add('d-none');
    document.getElementById('varroaProcessingStep').classList.remove('d-none');

    // Ensure model is loaded (lazy load)
    await getVarroaModel();
    // Warm‑up (optional, improves first‑run latency)
    await warmupVarroaModel();

    // Run detection
    const detections = await detectVarroaInImage(img);

    // Update UI with results
    const canvas = document.getElementById('varroaCanvas');
    // Resize canvas to original image dimensions
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    drawDetections(canvas, detections);

    const count = detections.length;
    const riskInfo = getRiskInfo(count);
    
    lastAnalysisResult = {
      count: count,
      risk: riskInfo.label,
      recommendation: riskInfo.recommendation,
      load: riskInfo.load
    };

    document.getElementById('varroaCount').textContent = count;
    const riskBadge = document.getElementById('varroaRisk');
    riskBadge.textContent = riskInfo.label;
    riskBadge.className = `badge bg-${riskInfo.color}`;
    document.getElementById('varroaRecommendation').textContent = riskInfo.recommendation;

    // Show result step
    document.getElementById('varroaProcessingStep').classList.add('d-none');
    document.getElementById('varroaResultStep').classList.remove('d-none');
  };
  img.onerror = () => {
    alert('Fotoğraf yüklenemedi. Lütfen başka bir dosya deneyin.');
  };
  img.src = URL.createObjectURL(file);
};

/**
 * Reset modal UI when opened.
 */
window.addEventListener('show.bs.modal', (event) => {
  if (event.target.id === 'varroaModal') {
    // Reset steps
    document.getElementById('varroaUploadStep').classList.remove('d-none');
    document.getElementById('varroaProcessingStep').classList.add('d-none');
    document.getElementById('varroaResultStep').classList.add('d-none');
    // Clear previous canvas/content
    const canvas = document.getElementById('varroaCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    document.getElementById('varroaCount').textContent = '-';
    const riskBadge = document.getElementById('varroaRisk');
    riskBadge.textContent = '-';
    riskBadge.className = 'badge';
    document.getElementById('varroaRecommendation').textContent = '';
    // Reset file input
    const fileInput = document.querySelector('#varroaModal input[type="file"]');
    if (fileInput) fileInput.value = '';
    lastAnalysisResult = null;
  }
});

/**
 * Save the last analysis result to Firebase.
 */
window.saveVarroaResult = async function() {
  if (!lastAnalysisResult) {
    alert('Kaydedilecek analiz sonucu bulunamadı.');
    return;
  }

  const db = window.db;
  const currentUser = window.currentUser;
  const kovanId = new URLSearchParams(window.location.search).get('id');

  if (!db || !currentUser || !kovanId) {
    alert('Oturum veya kovan bilgisi eksik. Lütfen sayfayı yenileyin.');
    return;
  }

  const data = {
    tarih: new Date().toISOString().split('T')[0],
    islem: 'Varroa Analizi (AI)',
    not: `AI tespiti: ${lastAnalysisResult.count} akar — ${lastAnalysisResult.risk}. ${lastAnalysisResult.recommendation}`,
    varroaYuk: lastAnalysisResult.load
  };

  try {
    await db.collection("kullanicilar").doc(currentUser.uid).collection("kovanlar").doc(kovanId).collection('bakimKayitlari').add(data);
    alert('Varroa analiz sonucu Bakım / Besleme kayıtlarına eklendi.');
    const modalEl = document.getElementById('varroaModal');
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
    // Optional: refresh records if needed
    if (window.yukle) window.yukle(); 
  } catch (e) {
    console.error("Kaydetme hatası:", e);
    alert('Kayıt eklenemedi: ' + e.message);
  }
};

/**
 * Reset analysis UI.
 */
window.resetVarroaAnalysis = function() {
  document.getElementById('varroaUploadStep').classList.remove('d-none');
  document.getElementById('varroaProcessingStep').classList.add('d-none');
  document.getElementById('varroaResultStep').classList.add('d-none');
  lastAnalysisResult = null;
};
