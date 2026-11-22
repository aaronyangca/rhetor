import { Eye, EyeOff } from 'lucide-react'
import { useId, useState, type InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

/**
 * The input *is* the rounded field — border, radius and padding all sit on the
 * <input> itself, with the password toggle overlaid on its right edge. There
 * is deliberately no inner box: anything the browser paints on the input
 * (focus ring, autofill highlight, password-manager preview) then covers the
 * whole field instead of exposing a smaller rectangle inside it. Autofill
 * colouring is neutralised in index.css (`.form-field`).
 */
export function FormInput({ label, type = 'text', className = '', id, ...rest }: FormInputProps) {
  const [reveal, setReveal] = useState(false)
  const generatedId = useId()
  const inputId = id ?? generatedId
  const isPassword = type === 'password'

  return (
    <div className={`flex w-full flex-col gap-[6px] ${className}`}>
      <label htmlFor={inputId} className="text-[13px] font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={isPassword && reveal ? 'text' : type}
          className={`form-field h-[46px] w-full rounded-md border border-border bg-card px-[14px] text-sm text-foreground ${
            isPassword ? 'pr-11' : ''
          }`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-[14px] -translate-y-1/2 text-muted-foreground"
            tabIndex={-1}
          >
            {reveal ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  )
}
