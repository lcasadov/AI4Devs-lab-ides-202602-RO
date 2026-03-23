import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SPECIAL_CHARS = '@$!%*?&';
const BCRYPT_SALT_ROUNDS = 12;

export function generatePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const specials = SPECIAL_CHARS;
  const allChars = uppercase + lowercase + digits + specials;

  let password = '';
  let attempts = 0;

  while (attempts < 100) {
    attempts++;
    const bytes = crypto.randomBytes(16);
    let candidate = '';

    // Pick one guaranteed char from each category
    candidate += uppercase[bytes[0] % uppercase.length];
    candidate += lowercase[bytes[1] % lowercase.length];
    candidate += digits[bytes[2] % digits.length];
    candidate += specials[bytes[3] % specials.length];

    // Fill remaining 8 positions
    for (let i = 4; i < 12; i++) {
      candidate += allChars[bytes[i] % allChars.length];
    }

    // Shuffle the candidate using Fisher-Yates
    const arr = candidate.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = bytes[(i + 4) % bytes.length] % (i + 1);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    candidate = arr.join('');

    // Check no more than 2 consecutive identical characters
    let valid = true;
    for (let i = 0; i < candidate.length - 2; i++) {
      if (candidate[i] === candidate[i + 1] && candidate[i + 1] === candidate[i + 2]) {
        valid = false;
        break;
      }
    }

    if (valid) {
      password = candidate;
      break;
    }
  }

  if (!password) {
    // Fallback: build deterministically valid password
    const fb = crypto.randomBytes(8);
    password =
      uppercase[fb[0] % uppercase.length] +
      lowercase[fb[1] % lowercase.length] +
      digits[fb[2] % digits.length] +
      specials[fb[3] % specials.length] +
      lowercase[fb[4] % lowercase.length] +
      uppercase[fb[5] % uppercase.length] +
      digits[fb[6] % digits.length] +
      lowercase[fb[7] % lowercase.length] +
      specials[0] +
      digits[1] +
      lowercase[0] +
      uppercase[1];
  }

  return password;
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (@$!%*?&).' };
  }
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i + 1] === password[i + 2]) {
      return { valid: false, message: 'Password must not contain more than 2 consecutive identical characters.' };
    }
  }
  return { valid: true };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
