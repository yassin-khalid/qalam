function toPascalCase(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function objectToFormData(
  obj: Record<string, any>,
  formData: FormData = new FormData(),
  parentKey: string = ''
): FormData {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const pascalKey = toPascalCase(key);
      const formKey = parentKey ? `${parentKey}.${pascalKey}` : pascalKey; // Use dot notation

      if (value === null || value === undefined) {
        continue;
      } else if (value instanceof File || value instanceof Blob) {
        formData.append(formKey, value, value instanceof File ? value.name : undefined);
      } else if (value instanceof Date) {
        // Handle Date objects
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, '0');
        const day = String(value.getDate()).padStart(2, '0');
        formData.append(formKey, `${year}-${month}-${day}`);
      } else if (Array.isArray(value)) {
        value.forEach((item: any, index: number) => {
          if (item instanceof File || item instanceof Blob) {
            formData.append(`${formKey}[${index}]`, item, item instanceof File ? item.name : undefined);
          } else if (
            typeof item === 'object' &&
            item !== null &&
            !(item instanceof File) &&
            !(item instanceof Blob) &&
            !(item instanceof Date)
          ) {
            // For objects in arrays, use array[index].property notation
            objectToFormData(item, formData, `${formKey}[${index}]`);
          } else {
            formData.append(`${formKey}[${index}]`, String(item));
          }
        });
      } else if (typeof value === 'object') {
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, String(value));
      }
    }
  }

  return formData;
}