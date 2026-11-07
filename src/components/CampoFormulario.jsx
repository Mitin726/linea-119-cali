// Envoltorio reutilizable para un campo del formulario: etiqueta, control y mensaje de error.
export default function CampoFormulario({ id, label, error, className = '', children }) {
  return (
    <div className={`campo ${error ? 'campo--error' : ''} ${className}`}>
      <label htmlFor={id} className="campo-label">
        {label} <span className="campo-obligatorio" aria-hidden="true">*</span>
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="campo-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
