import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function FormInput({ label, type = 'text', className = '', ...rest }: FormInputProps) {
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  return (
    <div className={`flex w-full flex-col gap-[6px] ${className}`}>
      <label className="text-[13px] font-medium text-foreground">{label}</label>
      <div className="flex h-[46px] w-full items-center gap-2 rounded-md border border-border bg-card px-[14px] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <input
          type={isPassword && reveal ? 'text' : type}
          className="w-full flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="shrink-0 text-muted-foreground"
            tabIndex={-1}
          >
            {reveal ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
    </div>
  )
}
