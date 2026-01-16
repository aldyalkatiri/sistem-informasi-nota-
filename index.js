import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- 1. KONFIGURASI FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCM3YRUd51lT2wFSOESJH-ZjvQQJeUJMUw",
    authDomain: "sistem-nota.firebaseapp.com",
    databaseURL: "https://sistem-nota-default-rtdb.firebaseio.com",
    projectId: "sistem-nota",
    storageBucket: "sistem-nota.firebasestorage.app",
    messagingSenderId: "1043542152932",
    appId: "1:1043542152932:web:21d4bc67f185fb4768fef1"
};

// --- 2. INISIALISASI ---
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dbRef = ref(db, 'nota_data');

// Map untuk mengubah kode menjadi deskripsi teks
const deskripsiMap = {
    "SL": "BAN",
    "SD": "LAS",
    "SI": "MEKANIK PERAWATAN",
    "SX": "MEKANIK",
    "SY": "GRASSES",
    "SG": "ELEKTRIK",
    "ST": "PERAWATAN ALAT BERAT"
};

// --- 3. FUNGSI SIMPAN DATA ---
const notaForm = document.getElementById('notaForm');
if (notaForm) {
    notaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const kode = document.getElementById('kodeJenis').value;
        const data = {
            tanggal: document.getElementById('tanggalNota').value,
            kode: kode,
            deskripsi: deskripsiMap[kode] || "Perbaikan Umum",
            shift: document.getElementById('shift').value,
            qty: parseInt(document.getElementById('jumlah').value),
            createdAt: new Date().getTime()
        };

        // Push data ke Firebase
        const newNotaRef = push(dbRef);
        set(newNotaRef, data)
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Data nota tersimpan di Cloud',
                    timer: 1500,
                    showConfirmButton: false
                });
                notaForm.reset();
            })
            .catch((error) => {
                Swal.fire('Error!', error.message, 'error');
            });
    });
}

// --- 4. FUNGSI TAMPILKAN DATA (REAL-TIME) ---
onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    const tbody = document.getElementById('tabelNota');
    tbody.innerHTML = "";

    // Variabel untuk statistik
    let totalNota = 0;
    let pagi = 0;
    let malam = 0;
    let totalQty = 0;

    if (data) {
        // Balik urutan agar data terbaru ada di paling atas
        const keys = Object.keys(data).reverse();
        
        keys.forEach((key, index) => {
            const item = data[key];

            // Update hitungan statistik
            totalNota++;
            totalQty += item.qty;
            if (item.shift === "PAGI") pagi++;
            if (item.shift === "MALAM") malam++;

            // Buat baris tabel
            const row = `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.tanggal}</td>
                    <td><span class="badge bg-secondary">${item.kode}</span></td>
                    <td class="text-start">${item.deskripsi}</td>
                    <td><span class="badge ${item.shift === 'PAGI' ? 'bg-info' : 'bg-dark'}">${item.shift}</span></td>
                    <td class="fw-bold text-primary">${item.qty}</td>
                    <td class="action-col">
                        <button onclick="hapusNota('${key}')" class="btn btn-sm btn-outline-danger border-0">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="7" class="text-muted p-4">Belum ada data nota tersimpan.</td></tr>`;
    }

    // Update Angka di Dashboard secara Real-time
    document.getElementById('statTotal').innerText = totalNota;
    document.getElementById('statPagi').innerText = pagi;
    document.getElementById('statMalam').innerText = malam;
    document.getElementById('statTotalQty').innerText = totalQty;
});

// --- 5. FUNGSI HAPUS DATA ---
window.hapusNota = (key) => {
    Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Data akan dihapus permanen dari cloud!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            const exactRef = ref(db, `nota_data/${key}`);
            remove(exactRef).then(() => {
                Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
            });
        }
    });
};

// --- 6. FUNGSI PENCARIAN ---
const inputCari = document.getElementById('cariData');
if (inputCari) {
    inputCari.addEventListener('keyup', function() {
        const filter = this.value.toLowerCase();
        const rows = document.querySelectorAll('#tabelNota tr');
        
        rows.forEach(row => {
            const text = row.innerText.toLowerCase();
            row.style.display = text.includes(filter) ? '' : 'none';
        });
    });
}

// --- 7. FUNGSI EXPORT EXCEL ---
window.exportToExcel = function() {
    const table = document.getElementById("tableToExport");
    // Hilangkan kolom aksi saat export agar excel rapi
    const wb = XLSX.utils.table_to_book(table, { sheet: "Data Nota" });
    XLSX.writeFile(wb, `Nota_Ali_Akatiri_${new Date().toLocaleDateString()}.xlsx`);
};

// --- 8. FUNGSI LOGOUT ---
window.logout = function() {
    Swal.fire({
        title: 'Logout?',
        text: "Anda akan kembali ke halaman login",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Logout'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "index.html";
        }
    });
};
