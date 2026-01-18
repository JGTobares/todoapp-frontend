// Utilidad para calcular fortaleza de contraseña
export const calculatePasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: '' };

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^a-zA-Z0-9]/.test(password),
  };

  // Calcular fuerza
  if (checks.length) strength += 1;
  if (checks.lowercase) strength += 1;
  if (checks.uppercase) strength += 1;
  if (checks.number) strength += 1;
  if (checks.special) strength += 1;
  if (password.length >= 12) strength += 1;

  // Determinar etiqueta y color
  let label, color;
  if (strength <= 2) {
    label = 'Débil';
    color = '#f44336';
  } else if (strength <= 4) {
    label = 'Media';
    color = '#ff9800';
  } else {
    label = 'Fuerte';
    color = '#4caf50';
  }

  return {
    strength: Math.min(strength, 6),
    maxStrength: 6,
    percentage: (strength / 6) * 100,
    label,
    color,
    checks,
  };
};
