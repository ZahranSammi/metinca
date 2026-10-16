<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->hasRole(['inventarisir', 'manager_gudang']);
    }

    public function rules(): array
    {
        return [
            'judul_laporan' => 'required|string|max:255',
            'periode_mulai' => 'required|date',
            'periode_selesai' => 'required|date|after_or_equal:periode_mulai',
            'purchase_document_id' => 'nullable|exists:purchase_documents,id',
            'catatan' => 'nullable|string|max:1000',
            'status' => 'nullable|in:DRAFT,SUBMITTED',
        ];
    }
}
