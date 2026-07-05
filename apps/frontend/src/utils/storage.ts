export const getUserFromStorage = (): any => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== 'undefined') {
      return JSON.parse(userStr);
    }
    return {};
  } catch {
    return {};
  }
};

export const getTenantId = (): string | undefined => {
  return getUserFromStorage()?.tenantId;
};