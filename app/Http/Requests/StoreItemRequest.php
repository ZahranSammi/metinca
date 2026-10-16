<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['staff_gudang', 'inventarisir', 'manager_gudang']);
    }

    public function rules(): array
    {
        $itemId = $this->route('id');

        return [
            'kode_barang' => 'required|string|max:50|unique:items,kode_barang,'.$itemId,
            'nama_barang' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'satuan' => 'required|string|max:50',
            'stok' => 'required|integer|min:0',
            'min_stok' => 'required|integer|min:0',
            'deskripsi' => 'nullable|string|max:1000',
        ];
    }
}
