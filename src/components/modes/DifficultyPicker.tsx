import { useAppSettings } from '../../context/AppSettings'
import { useClub } from '../../lib/club'
import { LEVELS, difficulty, setDifficulty, type Difficulty } from '../../lib/difficulty'
import type { TranslationKey } from '../../i18n/translations'

const OPTIONS: Difficulty[] = ['easy', 'normal', 'hard']
const KEY: Record<Difficulty, TranslationKey> = { easy: 'diff.easy', normal: 'diff.normal', hard: 'diff.hard' }

/** Elige la dificultad de la IA del Fatal (y el premio que da cada una) */
export default function DifficultyPicker() {
  const { t } = useAppSettings()
  useClub()
  const cur = difficulty()
  return (
    <div className="diff">
      <small className="diff__label">{t('diff.label')}</small>
      <div className="diff__opts">
        {OPTIONS.map(d => (
          <button key={d} type="button" className={cur === d ? 'on' : ''} onClick={() => setDifficulty(d)}>
            <b>{t(KEY[d])}</b>
            <small>{t('diff.reward', { x: LEVELS[d].reward.toString().replace('.', ',') })}</small>
          </button>
        ))}
      </div>
    </div>
  )
}
