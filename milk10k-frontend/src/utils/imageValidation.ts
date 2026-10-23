export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const validMimes = ['image/jpeg', 'image/png'];
  const validExtensions = ['.jpg', '.jpeg', '.png'];
  const fileNameLower = file.name.toLowerCase();

  const hasValidExt = validExtensions.some((ext) => fileNameLower.endsWith(ext));
  const hasValidMime = validMimes.includes(file.type);

  // PIL verify in backend expects actual JPEG or PNG
  if (!hasValidMime && !hasValidExt) {
    return {
      isValid: false,
      error: `File "${file.name}" has an unsupported format. Only JPEG (.jpg, .jpeg) and PNG (.png) images are accepted.`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File "${file.name}" (${sizeMb} MB) exceeds the maximum allowed size of 10 MB.`,
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: `File "${file.name}" is empty (0 bytes).`,
    };
  }

  return { isValid: true };
}
