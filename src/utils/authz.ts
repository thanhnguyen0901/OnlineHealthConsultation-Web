export function isUnauthorizedMessage(message: string | null | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes('forbidden') ||
    m.includes('unauthorized') ||
    m.includes('not authorized') ||
    m.includes('not allowed') ||
    m.includes('permission') ||
    m.includes('access denied') ||
    m.includes('khong co quyen') ||
    m.includes('không có quyền') ||
    m.includes('truy cap bi tu choi') ||
    m.includes('truy cập bị từ chối')
  );
}
