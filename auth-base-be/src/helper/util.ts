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
  plainPasword: string,
  hashedPasword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPasword + PEPPER, hashedPasword);
};
