<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Pembelian Barang Operasional - {{ $laporan->nomor_laporan }}</title>
    <style>
        body { font-family: 'Times New Roman', Times, serif; color: #111827; margin: 30px; font-size: 13px; line-height: 1.5; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
        .header h3 { margin: 4px 0; font-size: 15px; color: #374151; }
        .header p { margin: 2px 0; font-size: 11px; color: #6b7280; }
        .meta-table, .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .meta-table td { padding: 4px 8px; vertical-align: top; }
        .items-table th, .items-table td { border: 1px solid #374151; padding: 8px; text-align: left; }
        .items-table th { background-color: #f3f4f6; text-transform: uppercase; font-size: 11px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; border: 1px solid #111; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; margin-top: 50px; text-align: center; page-break-inside: avoid; }
        .signature-box { display: inline-block; width: 45%; vertical-align: top; text-align: center; }
        .signature-space { height: 70px; }
        @media print {
            .no-print { display: none; }
            body { margin: 0; }
        }
    </style>
</head>
<body>

    <div class="no-print" style="margin-bottom: 20px; text-align: right;">
        <button onclick="window.print()" style="background: #2563eb; color: #fff; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
            🖨️ Cetak / Simpan PDF
        </button>
    </div>

    <div class="header">
        <h2>PT METINCA PRIMA INDUSTRIAL WORKS</h2>
        <h3>DIVISI ACCOUNTING - SISTEM INVENTARISASI BARANG OPERASIONAL</h3>
        <p>Jl. Raya Industri Metinca No. 45, Jakarta | Telp: (021) 555-8989 | Email: accounting@metinca.co.id</p>
    </div>

    <h3 style="text-align: center; text-decoration: underline; margin-bottom: 20px;">
        LAPORAN PEMBELIAN BARANG OPERASIONAL
    </h3>

    <table class="meta-table">
        <tr>
            <td width="20%"><strong>Nomor Laporan</strong></td>
            <td width="30%">: {{ $laporan->nomor_laporan }}</td>
            <td width="20%"><strong>Tanggal Dibuat</strong></td>
            <td width="30%">: {{ $laporan->created_at?->format('d F Y H:i') }}</td>
        </tr>
        <tr>
            <td><strong>Judul Laporan</strong></td>
            <td>: {{ $laporan->judul_laporan }}</td>
            <td><strong>Status Dokumen</strong></td>
            <td>: <span class="badge">{{ $laporan->status }}</span></td>
        </tr>
        <tr>
            <td><strong>Periode</strong></td>
            <td>: {{ date('d/m/Y', strtotime($laporan->periode_mulai)) }} s.d {{ date('d/m/Y', strtotime($laporan->periode_selesai)) }}</td>
            <td><strong>Dibuat Oleh</strong></td>
            <td>: {{ $laporan->creator?->name }} ({{ $laporan->creator?->jabatan }})</td>
        </tr>
    </table>

    <h4 style="margin-bottom: 8px;">Rincian Transaksi Pembelian</h4>
    <table class="items-table">
        <thead>
            <tr>
                <th width="5%" class="text-center">No</th>
                <th width="35%">Nama Barang Operasional</th>
                <th width="15%" class="text-center">Jumlah / Satuan</th>
                <th width="20%" class="text-right">Harga Satuan</th>
                <th width="25%" class="text-right">Subtotal (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @if($laporan->purchaseDocument && $laporan->purchaseDocument->purchase && $laporan->purchaseDocument->purchase->items)
                @foreach($laporan->purchaseDocument->purchase->items as $item)
                    <tr>
                        <td class="text-center">{{ $no++ }}</td>
                        <td>{{ $item->nama_barang }}</td>
                        <td class="text-center">{{ $item->jumlah }} {{ $item->item?->satuan ?? 'Pcs' }}</td>
                        <td class="text-right">Rp {{ number_format($item->harga_satuan, 0, ',', '.') }}</td>
                        <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            @else
                <tr>
                    <td colspan="5" class="text-center" style="color: #6b7280; font-style: italic;">Tidak ada rincian item spesifik.</td>
                </tr>
            @endif
        </tbody>
        <tfoot>
            <tr style="font-weight: bold; background-color: #f9fafb;">
                <td colspan="4" class="text-right">TOTAL PENGELUARAN (RP):</td>
                <td class="text-right">Rp {{ number_format($laporan->total_pengeluaran, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
    </table>

    @if($laporan->catatan)
        <div style="margin-bottom: 30px; background: #f9fafb; border-left: 4px solid #3b82f6; padding: 10px 14px;">
            <strong>Catatan / Keterangan:</strong><br>
            {{ $laporan->catatan }}
        </div>
    @endif

    <div style="margin-top: 40px;">
        <div class="signature-box" style="float: left;">
            <p>Dibuat Oleh,<br><strong>Inventarisir Barang</strong></p>
            <div class="signature-space"></div>
            <p><u>{{ $laporan->creator?->name }}</u><br>NIP: {{ $laporan->creator?->nip ?? '-' }}</p>
        </div>

        <div class="signature-box" style="float: right;">
            <p>Disetujui & Diarsipkan Oleh,<br><strong>Manager Gudang</strong></p>
            <div class="signature-space"></div>
            <p><u>Dedy Pratama</u><br>NIP: MGR-001</p>
        </div>
        <div style="clear: both;"></div>
    </div>

</body>
</html>
