import { useState } from 'react'

interface Props {
  text: string
}

export default function Tooltip({ text }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onBlur={() => setOpen(false)}
        className="w-5 h-5 rounded-full bg-[#334155] text-[#94a3b8] text-xs font-bold flex items-center justify-center leading-none select-none focus:outline-none hover:bg-[#475569] transition-colors"
        aria-label="more info"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-7 start-0 w-64 bg-[#1e293b] border border-[#334155] text-[#cbd5e1] text-xs rounded-xl p-3 shadow-xl leading-relaxed"
        >
          {text}
          {/* small arrow */}
          <span className="absolute -bottom-1.5 start-3 w-3 h-3 bg-[#1e293b] border-b border-s border-[#334155] rotate-[-45deg]" />
        </span>
      )}
    </span>
  )
}
