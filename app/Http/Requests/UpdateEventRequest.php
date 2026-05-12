<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:100',
            'description' => 'sometimes|nullable|string',
            'date' => 'sometimes|required|date',
            'location' => 'sometimes|required|string',
            'capacity' => 'sometimes|required|integer|min:1',
            'cover_image' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'error' => 'VALIDATION_ERROR',
                'message' => 'Données invalides.',
                'details' => $validator->errors()->toArray(),
            ], 400)
        );
    }
}
