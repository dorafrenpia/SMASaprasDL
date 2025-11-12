// ===== Toggle Sidebar =====
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebar-overlay');

hamburgerBtn.addEventListener('click', () => {
  sidebar.classList.toggle('show');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('show');
  overlay.classList.remove('show');
});

// ===== Chart.js - Siswa per Kelas =====
const ctxSiswa = document.getElementById('siswaChart').getContext('2d');
new Chart(ctxSiswa, {
  type: 'bar',
  data: {
    labels: ['X IPA', 'X IPS', 'XI IPA', 'XI IPS', 'XII IPA', 'XII IPS'],
    datasets: [{
      label: 'Jumlah Siswa',
      data: [40, 35, 38, 30, 45, 42],
      backgroundColor: 'rgba(0, 123, 255, 0.7)',
      borderRadius: 5
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
  }
});

// ===== Chart.js - Kondisi Barang =====
const ctxBarang = document.getElementById('barangChart').getContext('2d');
new Chart(ctxBarang, {
  type: 'pie',
  data: {
    labels: ['Baik', 'Rusak', 'Diperbaiki'],
    datasets: [{
      data: [120, 12, 8],
      backgroundColor: [
        'rgba(40, 167, 69, 0.7)',
        'rgba(220, 53, 69, 0.7)',
        'rgba(255, 193, 7, 0.7)'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});
