// Componente de indicador de fortaleza de contraseña
import { Check, X } from 'lucide-react';
import { calculatePasswordStrength } from '../../utils/passwordStrength';

export function PasswordStrength({ password }) {
  if (!password) return null;

  const strength = calculatePasswordStrength(password);

  return (
    <div className="password-strength">
      <div className="password-strength-header">
        <span className="password-strength-label">Fortaleza:</span>
        <span 
          className="password-strength-value"
          style={{ color: strength.color }}
        >
          {strength.label}
        </span>
      </div>
      
      <div className="password-strength-bar">
        <div
          className="password-strength-fill"
          style={{
            width: `${strength.percentage}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>

      <div className="password-strength-checks">
        <div className={`password-check ${strength.checks.length ? 'valid' : ''}`}>
          {strength.checks.length ? <Check size={14} /> : <X size={14} />}
          <span>Mínimo 8 caracteres</span>
        </div>
        <div className={`password-check ${strength.checks.lowercase ? 'valid' : ''}`}>
          {strength.checks.lowercase ? <Check size={14} /> : <X size={14} />}
          <span>Letra minúscula</span>
        </div>
        <div className={`password-check ${strength.checks.uppercase ? 'valid' : ''}`}>
          {strength.checks.uppercase ? <Check size={14} /> : <X size={14} />}
          <span>Letra mayúscula</span>
        </div>
        <div className={`password-check ${strength.checks.number ? 'valid' : ''}`}>
          {strength.checks.number ? <Check size={14} /> : <X size={14} />}
          <span>Número</span>
        </div>
        <div className={`password-check ${strength.checks.special ? 'valid' : ''}`}>
          {strength.checks.special ? <Check size={14} /> : <X size={14} />}
          <span>Carácter especial</span>
        </div>
      </div>
    </div>
  );
}
