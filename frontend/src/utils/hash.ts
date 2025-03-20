export const hash = async (file: ArrayBuffer) => {
  const hash = await crypto.subtle.digest("SHA-256", file);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
};
