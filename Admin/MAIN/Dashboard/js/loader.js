document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".sidebar-menu a");
  const mainContent = document.getElementById("mainContent");

  links.forEach(link => {
    link.addEventListener("click", async (e) => {
      e.preventDefault();

      // Hapus active sebelumnya
      links.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const page = link.getAttribute("data-page");

      try {
        mainContent.innerHTML = "<p>⏳ Memuat halaman...</p>";
        const response = await fetch(`Main/${page}.html`);
        if (!response.ok) throw new Error("Halaman tidak ditemukan");

        const html = await response.text();
        mainContent.innerHTML = html;

        // 🔹 Jika halaman koneksi, jalankan tombol cek koneksi
        if (page === "koneksi") {
          const koneksiModule = await import(`./koneksi.js`);
          koneksiModule.initFirebaseCheckButton();
        }
        else if (page === "barangmasuk") {
          // Memuat dan menjalankan barangmasuk.js dan uploadbarangmasuk.js setelah halaman dimuat
          const bmModule = await import(`../js/barangmasuk.js`);
          bmModule.initBarangMasuk();  // Fungsi dari barangmasuk.js
            const tableModule = await import(`../js/databarangmasuk.js`);
  tableModule.initDataBarangMasuk();

        }
        else if (page === "data") {
          // Memuat dan menjalankan barangmasuk.js dan uploadbarangmasuk.js setelah halaman dimuat
          const bmModule = await import(`../js/databarangmasuk.js`);
          bmModule.initDataBarangMasuk();  // Fungsi dari barangmasuk.js

        }
          else if (page === "dropdown") {
          // Memuat dan menjalankan barangmasuk.js dan uploadbarangmasuk.js setelah halaman dimuat
          const bmModule = await import(`../js/dropdown.js`);
          bmModule.initDataBarangMasuk();  // Fungsi dari barangmasuk.js

        } else if (page === "barangmasuk") {
          // Memuat dan menjalankan barangmasuk.js dan uploadbarangmasuk.js setelah halaman dimuat
          const bmModule = await import(`../js/dropdownbarangmasuk.js`);
          bmModule.initDataBarangMasuk();  // Fungsi dari barangmasuk.js

        }

        else if (page === "historybarang") {
          // Memuat dan menjalankan barangmasuk.js dan uploadbarangmasuk.js setelah halaman dimuat
          const bmModule = await import(`../js/historybarangmasuk.js`);
          bmModule.initDataBarangMasuk();  // Fungsi dari barangmasuk.js

        }
         // =====================================================
        // 🧾 HALAMAN KERUSAKAN
        // =====================================================
        else if (page === "kerusakan") {
          const kerusakanModule = await import(`../js/kerusakan.js`);
          if (kerusakanModule.initKerusakanPage) {
            setTimeout(() => kerusakanModule.initKerusakanPage(), 50);
          }
        }
      } catch (err) {
        mainContent.innerHTML = `<p style="color:red;">⚠️ Gagal memuat halaman: ${err.message}</p>`;
      }
      
    });
  });
});
