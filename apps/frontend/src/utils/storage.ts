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

export const setUserToStorage = (user: any): void => {
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch {
    console.error('Failed to save user to storage');
  }
};

export const getTenantId = (): string | undefined => {
  return getUserFromStorage()?.tenantId;
};