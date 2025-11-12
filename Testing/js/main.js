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
      } catch (err) {
        mainContent.innerHTML = `<p style="color:red;">⚠️ Gagal memuat halaman: ${err.message}</p>`;
      }
    });
  });
});
