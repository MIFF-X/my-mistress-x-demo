export function createFeedbackForm(input = {}) {
  return {
    id: input.id || `feedback-form-${Date.now()}`,
    title: input.title || 'Feedback',
    fields: Array.isArray(input.fields) ? [...input.fields] : [
      { id: 'message', label: 'Message', required: true },
    ],
  };
}

export function validateFeedbackInput(form, values = {}) {
  return form.fields
    .filter((field) => field.required && !values[field.id])
    .map((field) => ({
      fieldId: field.id,
      message: `${field.label || field.id} is required`,
    }));
}

export function createFeedbackResponse(form, values = {}, respondentId = 'anonymous') {
  const errors = validateFeedbackInput(form, values);

  return {
    id: `feedback-response-${Date.now()}`,
    formId: form.id,
    respondentId,
    values: { ...values },
    status: errors.length ? 'invalid' : 'submitted',
    errors,
    submittedAt: new Date().toISOString(),
  };
}
