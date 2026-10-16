<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['karyawan', 'manager_gudang', 'staff_gudang', 'inventarisir']);
    }

    public function rules(): array
    {
        return [
            'catatan' => 'nullable|string|max:1000',
            'status' => 'required|in:DRAFT,SUBMITTED',
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'nullable|exists:items,id',
            'items.*.nama_barang' => 'required|string|max:255',
            'items.*.jumlah' => 'required|integer|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.alasan_kebutuhan' => 'required|string|max:1000',
            'items.*.estimasi_harga' => 'nullable|numeric|min:0',
        ];
    }
}
