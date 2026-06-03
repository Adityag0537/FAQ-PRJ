export function buildQuestionFormData({ title, description, categories, files = [] }) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("categories", JSON.stringify(categories));
  files.forEach((file) => formData.append("attachments", file));
  return formData;
}
