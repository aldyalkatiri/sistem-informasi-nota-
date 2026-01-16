<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard | Sistem Informasi Nota Ali Akatiri</title>
    
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="dashboard.css">
</head>
<body>

<nav class="navbar navbar-dark shadow-sm">
    <div class="container d-flex justify-content-between align-items-center">
        <span class="navbar-brand fw-bold">
            <i class="fas fa-database me-2 text-info"></i> SISTEM INFORMASI NOTA
        </span>
        <button onclick="logout()" class="btn btn-danger btn-sm px-4 fw-bold rounded-pill">
            <i class="fas fa-sign-out-alt me-1"></i> LOGOUT
        </button>
    </div>
</nav>

<div class="container my-5">
    
    <div class="row mb-4 text-center">
        <div class="col-md-3 mb-3">
            <div class="card stat-card-total p-4 shadow-sm h-100">
                <small>TOTAL NOTA</small>
                <h2 id="statTotal">0</h2>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card-pagi p-4 shadow-sm h-100">
                <small class="text-primary">SHIFT PAGI</small>
                <h2 id="statPagi" class="text-primary">0</h2>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card-malam p-4 shadow-sm h-100">
                <small>SHIFT MALAM</small>
                <h2 id="statMalam">0</h2>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card stat-card-qty p-4 shadow-sm h-100">
                <small>TOTAL SELURUH UNIT</small>
                <h2 id="statTotalQty">0</h2>
            </div>
        </div>
    </div>

    <div id="adminPanel" class="card mb-5 border-0 shadow">
        <div class="header-panel text-center">
            <h5 class="fw-bold mb-0"><i class="fas fa-edit me-2"></i>INPUT DATA NOTA BARU (CLOUD SYNC)</h5>
        </div>
        <div class="card-body p-4">
            <form id="notaForm">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-bold small">TANGGAL NOTA</label>
                        <input type="date" id="tanggalNota" class="form-control text-center" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold small">JENIS PERBAIKAN</label>
                        <select id="kodeJenis" class="form-select text-center" required>
                            <option value="" disabled selected>Pilih Jenis...</option>
                            <option value="SL">SL (BAN)</option>
                            <option value="SD">SD (LAS)</option>
                            <option value="SI">SI (MEKANIK PERAWATAN)</option>
                            <option value="SX">SX (MEKANIK)</option>
                            <option value="SY">SY (GRASSES)</option>
                            <option value="SG">SG (ELEKTRIK)</option>
                            <option value="ST">ST (PERAWATAN ALAT BERAT)</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold small">SHIFT KERJA</label>
                        <select id="shift" class="form-select text-center" required>
                            <option value="PAGI">PAGI</option>
                            <option value="MALAM">MALAM</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold small">JUMLAH (QTY)</label>
                        <input type="number" id="jumlah" class="form-control text-center" placeholder="0" required min="1">
                    </div>
                </div>
                <button type="submit" class="btn btn-primary w-100 mt-4 text-white shadow-sm py-2 fw-bold">
                    <i class="fas fa-save me-2"></i>SIMPAN DATA KE CLOUD
                </button>
            </form>
        </div>
    </div>

    <div class="card border-0 shadow-lg">
        <div class="card-body p-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-2">
                <h5 class="fw-bold mb-0"><i class="fas fa-list me-2 text-primary"></i>Rincian Data Real-time (Publik)</h5>
                <div class="d-flex gap-2">
                    <input type="text" id="cariData" class="form-control form-control-sm" placeholder="Cari data..." style="max-width: 250px;">
                    <button onclick="window.print()" class="btn btn-outline-dark btn-sm" title="Cetak Nota">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="exportToExcel()" class="btn btn-success btn-sm" title="Download Excel">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover align-middle text-center" id="tableToExport">
                    <thead>
                        <tr>
                            <th width="50">No</th>
                            <th>Tanggal</th>
                            <th>Kode</th>
                            <th class="text-start">Deskripsi Perbaikan</th>
                            <th>Shift</th>
                            <th>Qty</th>
                            <th class="action-col">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="tabelNota">
                        </tbody>
                </table>
            </div>
        </div>
    </div>

    <footer class="text-center mt-5 pb-4">
        <p class="text-muted small">
            Sistem Informasi Nota &copy; 2026 | Built with <i class="fas fa-heart text-danger"></i> by 
            <span class="fw-bold text-dark text-uppercase">Ali Akatiri</span>
        </p>
    </footer>
</div>

<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

<script type="module" src="dashboard.js"></script>

</body>
</html>
