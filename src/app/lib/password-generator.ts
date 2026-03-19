import { PasswordGeneratorOptions, GeneratedPassword } from '../types';

const CHARBASE_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARBASE_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const CHARBASE_NUMBERS = '0123456789';
const CHARBASE_SYMBOLS = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

export function calculateStrength(password: string): 'strong' | 'medium' | 'weak' {
  let score = 0;
  
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;

  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}

export function generatePassword(options: PasswordGeneratorOptions): GeneratedPassword {
  let charset = '';
  if (options.uppercase) charset += CHARBASE_UPPERCASE;
  if (options.lowercase) charset += CHARBASE_LOWERCASE;
  if (options.numbers) charset += CHARBASE_NUMBERS;
  if (options.symbols) charset += CHARBASE_SYMBOLS;

  // Fallback if user selects nothing
  if (!charset) {
    charset = CHARBASE_LOWERCASE + CHARBASE_NUMBERS;
  }

  let password = '';
  const array = new Uint32Array(options.length);
  crypto.getRandomValues(array);

  for (let i = 0; i < options.length; i++) {
    password += charset[array[i] % charset.length];
  }

  // Opcional: garantizar que tenga al menos un caracter de cada tipo seleccionado
  // Si la longitud lo permite
  if (options.length >= 4) {
    let requiredChars = '';
    if (options.uppercase) requiredChars += CHARBASE_UPPERCASE[crypto.getRandomValues(new Uint32Array(1))[0] % CHARBASE_UPPERCASE.length];
    if (options.lowercase) requiredChars += CHARBASE_LOWERCASE[crypto.getRandomValues(new Uint32Array(1))[0] % CHARBASE_LOWERCASE.length];
    if (options.numbers) requiredChars += CHARBASE_NUMBERS[crypto.getRandomValues(new Uint32Array(1))[0] % CHARBASE_NUMBERS.length];
    if (options.symbols) requiredChars += CHARBASE_SYMBOLS[crypto.getRandomValues(new Uint32Array(1))[0] % CHARBASE_SYMBOLS.length];

    // Reemplazar los primeros caracteres con los requeridos y luego barajar (opcional)
    // Para simplificar, simplemente generamos uno fuerte
    password = requiredChars + password.slice(requiredChars.length);
    
    // Barajar
    const passArray = password.split('');
    for (let i = passArray.length - 1; i > 0; i--) {
      const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
      [passArray[i], passArray[j]] = [passArray[j], passArray[i]];
    }
    password = passArray.join('');
  }

  return {
    password,
    strength: calculateStrength(password)
  };
}
