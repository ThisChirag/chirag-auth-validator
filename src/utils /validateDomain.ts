import dns from 'dns/promises';

export const validateEmailDomain = async (email: string): Promise<Boolean> => {
  const domain = email.split('@')[1];

  try {
    const bool = await dns.resolveMx(domain);
    return bool.length > 0;
  } catch {
    return false;
  }
};
