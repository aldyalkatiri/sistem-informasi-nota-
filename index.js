// PROTEKSI LOGIN
if (sessionStorage.getItem('isLoggedIn') !== 'true') { window.location.href = 'index.html'; }
const userRole = sessionStorage.getItem('role');
if (userRole === 'user') { document.getElementById('adminPanel').style.display = 'none'; }

function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

document.addEventListener('DOMContentLoaded', () => {
    const tglInput = document.getElementById('tanggalNota');
    if(tglInput) tglInput.value = new Date().toISOString().split('T')[0];
    loadData();
    document.getElementById('cariData')?.addEventListener('input', (e) => loadData(e.target.value.toLowerCase()));
});

document.getElementById('notaForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const select = document.getElementById('kodeJenis');
    const data = {
        id: Date.now(),
        tglNota: document.getElementById('tanggalNota').value,
        kode: select.value,
        deskripsi: select.options[select.selectedIndex].text,
        shift: document.getElementById('shift').value,
        jumlah: document.getElementById('jumlah').value
    };

    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    list.push(data);
    localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
    
    Swal.fire({ icon: 'success', title: 'Tersimpan!', showConfirmButton: false, timer: 1000 });
    this.reset();
    document.getElementById('tanggalNota').value = new Date().toISOString().split('T')[0];
    loadData();
});

function loadData(keyword = "") {
    const tabel = document.getElementById('tabelNota');
    if (!tabel) return;
    tabel.innerHTML = '';
    
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    
    document.getElementById('statTotal').innerText = list.length;
    document.getElementById('statPagi').innerText = list.filter(i => i.shift === 'PAGI').length;
    document.getElementById('statMalam').innerText = list.filter(i => i.shift === 'MALAM').length;

    let filtered = list.filter(item => 
        item.kode.toLowerCase().includes(keyword) || 
        item.deskripsi.toLowerCase().includes(keyword) ||
        item.tglNota.includes(keyword)
    );

    filtered.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-center fw-bold text-muted">${index + 1}</td>
            <td class="fw-bold">${item.tglNota}</td>
            <td><span class="badge bg-primary px-3">${item.kode}-${item.shift}</span></td>
            <td class="text-start">${item.deskripsi}</td>
            <td>
                <span class="badge ${item.shift === 'PAGI' ? 'badge-pagi' : 'badge-malam'}">
                    ${item.shift}
                </span>
            </td>
            <td class="fw-bold">${item.jumlah}</td>
            <td class="action-col">
                ${userRole === 'admin' ? `<button onclick="deleteData(${item.id})" class="btn btn-link text-danger p-0"><i class="fas fa-trash-alt"></i></button>` : '-'}
            </td>
        `;
        tabel.appendChild(row);
    });
}

function deleteData(id) {
    Swal.fire({
        title: 'Hapus data?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
        if (result.isConfirmed) {
            let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
            list = list.filter(i => i.id !== id);
            localStorage.setItem('db_ali_akatiri', JSON.stringify(list));
            loadData();
        }
    });
}

function exportToExcel() {
    let list = JSON.parse(localStorage.getItem('db_ali_akatiri')) || [];
    const ws = XLSX.utils.json_to_sheet(list);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `Laporan_Nota_Ali_Akatiri.xlsx`);
}
