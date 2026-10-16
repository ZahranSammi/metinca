<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TransitionDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorized inside state machine based on document & role
    }

    public function rules(): array
    {
        return [
            'action' => 'required|string|in:submit,approve,reject,revise,archive',
            'catatan' => 'required_if:action,reject|nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'catatan.required_if' => 'Catatan alasan penolakan wajib diisi saat menolak dokumen.',
        ];
    }
}
