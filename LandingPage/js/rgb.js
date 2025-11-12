// Ambil elemen hero-gradient
const heroGradient = document.querySelector('.hero-gradient');

let t = 0;           // waktu animasi
let direction = 1;   // 1 = maju, -1 = mundur

function animateHeroRGB() {
  // Update step 0-1
  t += 0.005 * direction;
  if (t >= 1 || t <= 0) direction *= -1; // balik arah saat mencapai ujung

  // Interpolasi RGB untuk dua warna gradien
  const r1 = Math.round(0 + t * 0);       // tetap 0
  const g1 = Math.round(198 + t * 30);    // biru muda ke lebih cerah
  const b1 = Math.round(255 - t * 20);    // biru tetap dominan

  const r2 = Math.round(0 + t * 0);       
  const g2 = Math.round(114 + t * 40);    // biru tua ke lebih gelap
  const b2 = Math.round(255 - t * 60);    

  // Terapkan gradien ke background
  heroGradient.style.background = `linear-gradient(90deg, rgb(${r1},${g1},${b1}), rgb(${r2},${g2},${b2}))`;

  requestAnimationFrame(animateHeroRGB);
}

// Mulai animasi
animateHeroRGB();
