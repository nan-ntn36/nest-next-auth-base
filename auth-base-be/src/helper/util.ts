import bcrypt from 'bcrypt';

const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
const PEPPER = process.env.PEPPER || 'trungnghia';

export const hashPassword = async (plainPassword: string): Promise<string> => {
  if (plainPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  try {
    return await bcrypt.hash(plainPassword + PEPPER, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Error hashing password: Unknown error');
  }
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  if (!plainPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainPassword + PEPPER, hashedPassword);
};

export const isEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
