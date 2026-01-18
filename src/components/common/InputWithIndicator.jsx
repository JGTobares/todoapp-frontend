// Componente Input con indicador
export function InputWithIndicator({ type = "text", className = "", ...props }) {
  return (
    <div className="input-wrapper">
      <input type={type} className={className} {...props} />
    </div>
  );
}

export function TextareaWithIndicator({ className = "", ...props }) {
  return (
    <div className="textarea-wrapper">
      <textarea className={className} {...props} />
    </div>
  );
}
