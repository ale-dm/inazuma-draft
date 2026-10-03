import { useAppSettings } from '../context/AppSettings'
import type { TranslationKey } from '../i18n/translations'
import Sheet from './hub/Sheet'

const SECTIONS: { title: TranslationKey; body: TranslationKey }[] = [
  { title: 'rules.draft.t', body: 'rules.draft.b' },
  { title: 'rules.chem.t', body: 'rules.chem.b' },
  { title: 'rules.fatal.t', body: 'rules.fatal.b' },
  { title: 'rules.cups.t', body: 'rules.cups.b' },
  { title: 'rules.club.t', body: 'rules.club.b' },
]

/** Cómo se juega: draft, química, Fatal, copas y club */
export default function RulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useAppSettings()
  return (
    <Sheet open={open} title={t('rules.title')} onClose={onClose}>
      <div className="rules">
        {SECTIONS.map(s => (
          <section key={s.title}>
            <h3>{t(s.title)}</h3>
            <p>{t(s.body)}</p>
          </section>
        ))}
      </div>
    </Sheet>
  )
}
