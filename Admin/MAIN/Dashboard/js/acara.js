import { db3 } from '../../../../../../MAIN/firebasesma.js';
import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
// ====================================================
// 🚀 Init dipanggil loader
// ====================================================
export function initAcara() {
    console.log("Acara page loaded.");

    const btn = document.getElementById("btnBuatForm");
    if (btn) btn.addEventListener("click", createForm);

    // Tambahkan search field
    const searchContainer = document.getElementById("searchContainer");
    if (searchContainer) {
        const input = document.createElement("input");
        input.id = "searchAcara";
        input.placeholder = "Cari acara...";
        input.addEventListener("input", searchAcara);
        searchContainer.appendChild(input);
    }

    loadAcara();
}
// ====================================================
// 🔹 Render daftar acara (bisa dipakai filter search)
// ====================================================
function renderAcara(acaraList) {
    const listContainer = document.getElementById("listAcara");
    listContainer.innerHTML = "";

    acaraList.forEach((data) => {
        const item = document.createElement("div");
        item.style.margin = "10px 0";
        item.style.padding = "10px";
        item.style.border = "1px solid #ccc";
        item.style.borderRadius = "8px";
        item.style.display = "flex";
        item.style.alignItems = "center";
        item.style.gap = "10px";

        // Tombol buka form
        const btn = document.createElement("button");
        btn.textContent = "Edit / Buka Form";
        btn.onclick = () => openForm(data, data.docId);

        // Tombol tandai selesai
        const btnSelesai = document.createElement("button");
        btnSelesai.textContent = data.status === "selesai" ? "✔ Selesai" : "Tandai Selesai";
        btnSelesai.onclick = async () => {
            try {
                const docRef = doc(db3, "acara", data.docId);
                await updateDoc(docRef, { status: "selesai" });
                data.status = "selesai";
                btnSelesai.textContent = "✔ Selesai";
            } catch (error) {
                console.error("Gagal update status:", error);
                alert("Terjadi kesalahan saat update status!");
            }
        };

        const info = document.createElement("div");
        info.innerHTML = `
            <strong>${data.namaAcara}</strong> (${data.kodeAcara})<br>
            PIC: ${data.picAcara}<br>
            <small>Tanggal: ${data.tanggalAcara}</small><br>
            <small>Status: ${data.status || "Belum selesai"}</small>
        `;

        item.appendChild(btn);
        item.appendChild(btnSelesai);
        item.appendChild(info);
        listContainer.appendChild(item);
    });
}

// ====================================================
// 🔹 Fungsi search acara
// ====================================================
function searchAcara(e) {
    const keyword = e.target.value.toLowerCase();
    const filtered = allAcara.filter(a => a.namaAcara.toLowerCase().startsWith(keyword));
    renderAcara(filtered);
}
// ====================================================
// 📌 Membuat Form untuk tambah acara baru
// ====================================================
function createForm() {
    const container = document.getElementById("formContainer");
    container.innerHTML = `
        <h2>Form Acara Baru</h2>
        <label>Nama Acara:</label><br>
        <input id="nama" type="text" placeholder="Contoh: Bulan Bahasa"><br><br>
        <label>PIC Acara:</label><br>
        <input id="pic" type="text" placeholder="Contoh: Frendy Hansun"><br><br>
        <label>Tanggal Acara:</label><br>
        <input id="tanggal" type="date"><br><br>
        <button id="btnSaveAcara">Simpan</button>
    `;
    document.getElementById("btnSaveAcara")
        .addEventListener("click", saveAcara);
}

// ====================================================
// 💾 Simpan Acara ke Firestore
// ====================================================
async function saveAcara() {
    const nama = document.getElementById("nama").value.trim();
    const pic = document.getElementById("pic").value.trim();
    const tanggal = document.getElementById("tanggal").value;

    if (!nama || !pic || !tanggal) {
        alert("Semua field wajib diisi!");
        return;
    }

    const kodeAcara = generateKodeAcara(nama, pic, tanggal);

    try {
        await addDoc(collection(db3, "acara"), {
            kodeAcara,
            namaAcara: nama,
            picAcara: pic,
            tanggalAcara: tanggal,
            keperluanList: [] // 🔹 Array untuk menampung semua keperluan
        });

        alert(`Acara berhasil disimpan!\nKode: ${kodeAcara}`);
        loadAcara();
    } catch (error) {
        console.error("Gagal menyimpan acara:", error);
        alert("Terjadi kesalahan saat menyimpan acara!");
    }
}

// ====================================================
// 🔹 Generate kode acara otomatis
// ====================================================
function generateKodeAcara(nama, pic, tanggal) {
    const namaInisial = nama.split(" ").map(w => w[0].toUpperCase()).join("");
    const picInisial = pic.split(" ").map(w => w[0].toUpperCase()).join("");
    const dt = new Date(tanggal);
    const dd = String(dt.getDate()).padStart(2, "0");
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const yyyy = dt.getFullYear();
    return `${namaInisial}/${picInisial}/${dd}-${mm}-${yyyy}`;
}
// ====================================================
// 📋 Load daftar acara (versi terbaru: support search + tandai selesai)
// ====================================================
let allAcara = []; // array untuk menampung semua acara

async function loadAcara() {
    const listContainer = document.getElementById("listAcara");
    if (!listContainer) return;

    listContainer.innerHTML = "⏳ Memuat...";

    try {
        const snapshot = await getDocs(collection(db3, "acara"));
        allAcara = []; // reset
        listContainer.innerHTML = "";

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            allAcara.push({ ...data, docId });
        });

        renderAcara(allAcara); // render semua acara
    } catch (error) {
        console.error("Gagal load acara:", error);
        listContainer.innerHTML = "Gagal memuat daftar acara.";
    }
}function openForm(data, docId) {
    const container = document.getElementById("formContainer");

    container.innerHTML = `
        <h2>Form Input Keperluan - ${data.namaAcara}</h2>

        <form id="keperluanForm">
            <label>Keperluan:</label>
            <input type="text" id="keperluan" />

            <label>Qty:</label>
            <input type="number" id="qty" />

            <label>Satuan:</label>
            <input type="text" id="satuan" />

            <label>Harga Satuan:</label>
            <input type="text" id="harga" placeholder="Rp ..." />

            <label>Catatan Keperluan Perdivisi:</label>
            <textarea id="catatan" rows="2"></textarea>

            <label>ACC:</label>
            <input type="text" id="acc" />

            <label>Catatan Manajemen & Sapras:</label>
            <textarea id="catatanManajemen" rows="2"></textarea>

            <label>Pengecekan Sapras:</label>
            <input type="text" id="pengecekan" />

            <label>Kategori:</label>
            <input type="text" id="kategori" />

            <label>PIC:</label>
            <input type="text" id="pic" />

            <!-- Tanggal per item -->
            <label>Tanggal Peminjaman:</label>
            <input type="date" id="tanggalPeminjaman"><br><br>

            <label>Tanggal Pengembalian:</label>
            <input type="date" id="tanggalPengembalian"><br><br>

            <button type="submit" id="submitKeperluan">Tambah / Simpan</button>
        </form>

        <table id="tabelKeperluan">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Keperluan</th>
                    <th>Qty</th>
                    <th>Satuan</th>
                    <th>Harga Satuan</th>
                    <th>Catatan Perdivisi</th>
                    <th>ACC</th>
                    <th>Catatan Manajemen & Sapras</th>
                    <th>Pengecekan Sapras</th>
                    <th>Kategori</th>
                    <th>PIC</th>
                    <th>Tanggal Peminjaman</th>
                    <th>Tanggal Pengembalian</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;

    const form = document.getElementById("keperluanForm");
    const tbody = document.querySelector("#tabelKeperluan tbody");
    let editIndex = null;

    if (data.keperluanList && data.keperluanList.length > 0) {
        data.keperluanList.forEach((k, index) => addRow(k, index));
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const keperluan = document.getElementById("keperluan").value;
        const qty = document.getElementById("qty").value;
        const satuan = document.getElementById("satuan").value;
        const harga = document.getElementById("harga").value;
        const catatan = document.getElementById("catatan").value;
        const acc = document.getElementById("acc").value;
        const catatanManajemen = document.getElementById("catatanManajemen").value;
        const pengecekan = document.getElementById("pengecekan").value;
        const kategori = document.getElementById("kategori").value;
        const pic = document.getElementById("pic").value;
        const tanggalPeminjaman = document.getElementById("tanggalPeminjaman").value;
        const tanggalPengembalian = document.getElementById("tanggalPengembalian").value;

        const newItem = { keperluan, qty, satuan, harga, catatan, acc, catatanManajemen, pengecekan, kategori, pic, tanggalPeminjaman, tanggalPengembalian };

        if (editIndex !== null) {
            data.keperluanList[editIndex] = newItem;
            tbody.children[editIndex].innerHTML = generateRowHTML(newItem, editIndex);
            editIndex = null;
        } else {
            data.keperluanList.push(newItem);
            addRow(newItem, data.keperluanList.length - 1);
        }

        form.reset();

        try {
            const docRef = doc(db3, "acara", docId);
            await updateDoc(docRef, { keperluanList: data.keperluanList });
        } catch (error) {
            console.error("Gagal simpan keperluan:", error);
            alert("Terjadi kesalahan saat menyimpan keperluan!");
        }
    });

    function addRow(item, index) {
        const row = document.createElement("tr");
        row.innerHTML = generateRowHTML(item, index);
        tbody.appendChild(row);

        row.querySelector(".btnEdit").addEventListener("click", () => {
            editIndex = index;
            document.getElementById("keperluan").value = item.keperluan;
            document.getElementById("qty").value = item.qty;
            document.getElementById("satuan").value = item.satuan;
            document.getElementById("harga").value = item.harga;
            document.getElementById("catatan").value = item.catatan;
            document.getElementById("acc").value = item.acc;
            document.getElementById("catatanManajemen").value = item.catatanManajemen;
            document.getElementById("pengecekan").value = item.pengecekan;
            document.getElementById("kategori").value = item.kategori;
            document.getElementById("pic").value = item.pic;
            document.getElementById("tanggalPeminjaman").value = item.tanggalPeminjaman || '';
            document.getElementById("tanggalPengembalian").value = item.tanggalPengembalian || '';
        });
    }

    function generateRowHTML(item, index) {
        return `
            <td>${index + 1}</td>
            <td>${item.keperluan}</td>
            <td>${item.qty}</td>
            <td>${item.satuan}</td>
            <td>${item.harga}</td>
            <td>${item.catatan}</td>
            <td>${item.acc}</td>
            <td>${item.catatanManajemen}</td>
            <td>${item.pengecekan}</td>
            <td>${item.kategori}</td>
            <td>${item.pic}</td>
            <td>${item.tanggalPeminjaman || '-'}</td>
            <td>${item.tanggalPengembalian || '-'}</td>
            <td><button class="btnEdit">Edit</button></td>
        `;
    }
}
