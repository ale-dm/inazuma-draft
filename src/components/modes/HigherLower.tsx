import { useState } from 'react'
import type { Player } from '../../types'
import { useAppSettings } from '../../context/AppSettings'
import { getAllPlayers } from '../../data/catalog'
import { duelStats } from '../../lib/duel'
import { addCoins, getClub, track, updateClub } from '../../lib/club'
import { playSfx } from '../../lib/sfx'
import InaCard from '../InaCard'
import Coin from '../Coin'
import Screen from '../club/Screen'
import { ArrowDown, ArrowUp } from 'lucide-react'

/** Estadística de cada ronda: la media o uno de los 3 números del duelo */
type Stat = 'ovr' | 'att' | 'con' | 'def'
const STATS: Stat[] = ['ovr', 'att', 'con', 'def']
/** Monedas por acierto al terminar */
export const HL_COINS = 50

const value = (p: Player, s: Stat) => (s === 'ovr' ? p.ovr : duelStats(p)[s])

function randomCard(not?: Player): Player {
  const pool = getAllPlayers().filter(p => p.image)
  for (;;) {
    const p = pool[Math.floor(Math.random() * pool.length)]
    if (!not || p.characterId !== not.characterId) return p
  }
}

interface Round { a: Player; b: Player; stat: Stat }
const newRound = (a = randomCard()): Round => ({ a, b: randomCard(a), stat: STATS[Math.floor(Math.random() * STATS.length)] })

/**
 * Higher/Lower (fase 4): se ve una carta con una estadística (media, ataque, control o defensa) y hay que adivinar si
 * la siguiente la tiene más alta o más baja. Empate = acierto. Cada acierto suma a la racha; al fallar se cobra.
 */
export default function HigherLower() {
  const { t } = useAppSettings()
  const [round, setRound] = useState<Round>(() => newRound())
  const [streak, setStreak] = useState(0)
  const [reveal, setReveal] = useState<null | boolean>(null)
  const [over, setOver] = useState(false)
  const best = getClub().hlBest

  function guess(higher: boolean) {
    if (reveal !== null) return
    const va = value(round.a, round.stat)
    const vb = value(round.b, round.stat)
    const ok = va === vb || (higher ? vb > va : vb < va)
    setReveal(ok)
    playSfx(ok ? 'pick' : 'roll')
    setTimeout(() => {
      if (ok) {
        setStreak(s => s + 1)
        setRound(newRound(round.b))
        setReveal(null)
      } else {
        const coins = streak * HL_COINS
        if (coins) addCoins(coins)
        track('hl')
        updateClub(s => ({ ...s, hlBest: Math.max(s.hlBest, streak) }))
        setOver(true)
      }
    }, 1100)
  }

  function restart() {
    setRound(newRound())
    setStreak(0)
    setReveal(null)
    setOver(false)
  }

  const label = t(`hl.stat.${round.stat}`)
  return (
    <Screen title={t('hub.higherLower')}>
      <p className="fd-hint">{t('hl.rules', { n: HL_COINS })}</p>
      <div className="hl-bar">
        <span>{t('hl.streak')} <b>{streak}</b></span>
        <span>{t('hl.best')} <b>{Math.max(best, streak)}</b></span>
      </div>
      <div className="hl-cards">
        <div className="hl-side">
          <InaCard player={round.a} size="md" />
          <span className="hl-val"><small>{label}</small>{value(round.a, round.stat)}</span>
        </div>
        <div className="hl-side">
          <InaCard player={round.b} size="md" />
          <span className={`hl-val ${reveal === true ? 'is-ok' : reveal === false ? 'is-ko' : ''}`}>
            <small>{label}</small>{reveal === null ? '?' : value(round.b, round.stat)}
          </span>
        </div>
      </div>
      {over ? (
        <div className="duel-end">
          <h2 className="fd-title">{t('hl.over', { n: streak })}</h2>
          {streak > 0 && <p className="reward-line">+<Coin className="w-5 h-5" /> {streak * HL_COINS}</p>}
          <button type="button" className="sheet-cta" onClick={restart}>{t('duel.again')}</button>
        </div>
      ) : (
        <div className="hl-actions">
          <button type="button" className="sheet-cta" disabled={reveal !== null} onClick={() => guess(true)}><ArrowUp className="inline" /> {t('hl.higher')}</button>
          <button type="button" className="sheet-cta sheet-cta--alt" disabled={reveal !== null} onClick={() => guess(false)}><ArrowDown className="inline" /> {t('hl.lower')}</button>
        </div>
      )}
    </Screen>
  )
}
