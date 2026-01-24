export function objectToFormData(
  obj: Record<string, any>,
  formData: FormData = new FormData(),
  parentKey: string = ''
): FormData {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;

      if (value === null || value === undefined) {
        // Skip null/undefined values
        continue;
      } else if (value instanceof File || value instanceof Blob) {
        // Handle File and Blob objects
        formData.append(formKey, value);
      } else if (Array.isArray(value)) {
        // Handle arrays
        value.forEach((item: any, index: number) => {
          if (
            typeof item === 'object' &&
            !(item instanceof File) &&
            !(item instanceof Blob)
          ) {
            objectToFormData({ [index]: item }, formData, formKey);
          } else {
            formData.append(`${formKey}[]`, item);
          }
        });
      } else if (typeof value === 'object') {
        // Recursively handle nested objects
        objectToFormData(value, formData, formKey);
      } else {
        // Handle primitive values
        formData.append(formKey, String(value));
      }
    }
  }
  return formData;
}
