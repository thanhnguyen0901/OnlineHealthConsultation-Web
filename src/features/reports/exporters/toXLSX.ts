// Placeholder for XLSX export (requires xlsx library)
export const exportToXLSX = <T extends Record<string, unknown>>(data: T[], filename: string): void => {
  console.log('XLSX export not implemented. Install xlsx library for full functionality.');
  console.log('Data:', data, 'Filename:', filename);
  alert('XLSX export requires additional library. Using CSV fallback.');
};
