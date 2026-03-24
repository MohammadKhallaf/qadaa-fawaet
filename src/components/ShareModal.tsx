import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/store'

type Tab = 'qr' | 'clipboard' | 'import'

interface Props {
  onClose: () => void
}

export default function ShareModal({ onClose }: Props) {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('qr')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [qrError, setQrError] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [importResult, setImportResult] = useState<'idle' | 'ok' | 'fail'>('idle')
  const { getBackupJson, importBackup } = useStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const json = getBackupJson()

  // Generate QR on mount
  useEffect(() => {
    QRCode.toDataURL(json, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 280,
      color: { dark: '#f1f5f9', light: '#1e293b' },
    })
      .then(url => setQrDataUrl(url))
      .catch(() => setQrError(true))
  }, [json])

  function handleCopy() {
    navigator.clipboard.writeText(json).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  function handleImport() {
    const ok = importBackup(pasteText.trim())
    setImportResult(ok ? 'ok' : 'fail')
    if (ok) setTimeout(onClose, 1200)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'qr',        label: t('share.tabQr') },
    { id: 'clipboard', label: t('share.tabClipboard') },
    { id: 'import',    label: t('share.tabImport') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm bg-[#1e293b] rounded-t-3xl pb-8 pt-4 px-4">

        {/* drag handle */}
        <div className="w-12 h-1.5 bg-[#334155] rounded-full mx-auto mb-4" />

        <h2 className="text-[#f1f5f9] font-bold text-lg text-center mb-4">{t('share.title')}</h2>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#0f172a] rounded-xl p-1 mb-5">
          {tabs.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tab === id ? 'bg-[#047857] text-white' : 'text-[#64748b]'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* QR tab */}
        {tab === 'qr' && (
          <div className="flex flex-col items-center gap-4">
            <p className="text-[#64748b] text-sm text-center">{t('share.qrInstructions')}</p>
            {qrError && (
              <p className="text-[#f87171] text-sm text-center">{t('share.qrTooLarge')}</p>
            )}
            {!qrError && qrDataUrl && (
              <img src={qrDataUrl} alt="QR backup" className="rounded-xl w-64 h-64" />
            )}
            {!qrError && !qrDataUrl && (
              <div className="w-64 h-64 rounded-xl bg-[#0f172a] flex items-center justify-center">
                <p className="text-[#64748b] text-xs">{t('share.generating')}</p>
              </div>
            )}
            <p className="text-[#475569] text-xs text-center">{t('share.qrScanHint')}</p>
          </div>
        )}

        {/* Clipboard tab */}
        {tab === 'clipboard' && (
          <div className="flex flex-col gap-4">
            <p className="text-[#64748b] text-sm text-center">{t('share.clipboardInstructions')}</p>
            <button onClick={handleCopy}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${copied ? 'bg-[#34d399] text-[#0f172a]' : 'bg-[#047857] text-white'}`}>
              {copied ? t('share.copied') : t('share.copyButton')}
            </button>
            <div className="bg-[#0f172a] rounded-xl p-3 max-h-32 overflow-auto">
              <pre className="text-[#475569] text-[10px] break-all whitespace-pre-wrap select-all">{json}</pre>
            </div>
            <p className="text-[#475569] text-xs text-center">{t('share.clipboardHint')}</p>
          </div>
        )}

        {/* Import tab */}
        {tab === 'import' && (
          <div className="flex flex-col gap-4">
            <p className="text-[#64748b] text-sm text-center">{t('share.importInstructions')}</p>
            <textarea
              ref={textareaRef}
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setImportResult('idle') }}
              placeholder={t('share.pastePlaceholder')}
              className="w-full bg-[#0f172a] text-[#f1f5f9] text-xs rounded-xl p-3 border border-[#334155] focus:border-[#047857] outline-none h-32 resize-none"
            />
            {importResult === 'fail' && (
              <p className="text-[#f87171] text-xs text-center">{t('share.importFailed')}</p>
            )}
            {importResult === 'ok' && (
              <p className="text-[#34d399] text-xs text-center">{t('share.importSuccess')}</p>
            )}
            <button onClick={handleImport} disabled={!pasteText.trim()}
              className="w-full py-3 rounded-xl bg-[#047857] text-white font-bold text-sm disabled:opacity-40">
              {t('share.importButton')}
            </button>
          </div>
        )}

        <button onClick={onClose}
          className="w-full mt-4 py-3 rounded-xl text-[#64748b] text-sm">
          {t('share.close')}
        </button>
      </div>
    </div>
  )
}
