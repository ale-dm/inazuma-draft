/** Sonidos de la app; los del duelo (flip, tech, win, lose, shout, tick) se oyen en las revelaciones */
export type SfxKind = 'roll' | 'pick' | 'goal' | 'qualify' | 'flip' | 'tech' | 'win' | 'lose' | 'shout' | 'tick'

let ctx: AudioContext | null = null
let enabled = true

function getCtx(): AudioContext | null {
  if (!enabled) return null
  try {
    if (!ctx) ctx = new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

export function setSfxEnabled(on: boolean) {
  enabled = on
  if (!on && ctx) {
    void ctx.close()
    ctx = null
  }
}

export function isSfxEnabled() {
  return enabled
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain = 0.08) {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime + start)
  g.gain.setValueAtTime(0, ac.currentTime + start)
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur)
  osc.connect(g)
  g.connect(ac.destination)
  osc.start(ac.currentTime + start)
  osc.stop(ac.currentTime + start + dur + 0.02)
}

export function playSfx(kind: SfxKind) {
  if (!enabled) return
  switch (kind) {
    case 'roll':
      tone(220, 0, 0.08, 'square', 0.05)
      tone(330, 0.06, 0.1, 'square', 0.04)
      tone(440, 0.14, 0.12, 'triangle', 0.06)
      break
    case 'pick':
      tone(523, 0, 0.1, 'triangle', 0.07)
      tone(784, 0.08, 0.14, 'triangle', 0.05)
      break
    case 'goal':
      tone(392, 0, 0.12, 'square', 0.06)
      tone(523, 0.1, 0.12, 'square', 0.06)
      tone(659, 0.2, 0.2, 'triangle', 0.07)
      break
    case 'flip':
      tone(180, 0, 0.12, 'sawtooth', 0.03)
      tone(260, 0.1, 0.12, 'sawtooth', 0.025)
      break
    case 'tech':
      tone(300, 0, 0.1, 'sawtooth', 0.04)
      tone(450, 0.08, 0.1, 'sawtooth', 0.045)
      tone(680, 0.16, 0.16, 'triangle', 0.06)
      break
    case 'win':
      tone(523, 0, 0.1, 'triangle', 0.07)
      tone(659, 0.09, 0.1, 'triangle', 0.07)
      tone(784, 0.18, 0.22, 'triangle', 0.08)
      break
    case 'lose':
      tone(330, 0, 0.14, 'triangle', 0.05)
      tone(262, 0.14, 0.24, 'triangle', 0.05)
      break
    case 'shout':
      tone(660, 0, 0.08, 'square', 0.05)
      tone(990, 0.06, 0.18, 'square', 0.05)
      break
    case 'tick':
      tone(880, 0, 0.04, 'square', 0.03)
      break
    case 'qualify':
      tone(440, 0, 0.15, 'triangle', 0.06)
      tone(554, 0.12, 0.15, 'triangle', 0.06)
      tone(659, 0.24, 0.15, 'triangle', 0.06)
      tone(880, 0.36, 0.25, 'triangle', 0.07)
      break
  }
}

/** Vibración corta en el móvil (si el dispositivo la tiene); va con el mismo interruptor de sonido */
export type BuzzKind = 'tap' | 'goal' | 'conceded' | 'win' | 'lose'
const PATTERN: Record<BuzzKind, number | number[]> = {
  tap: 12,
  goal: [40, 60, 90],
  conceded: [120],
  win: [30, 50, 30, 50, 60],
  lose: [80, 60, 80],
}

export function buzz(kind: BuzzKind) {
  if (!enabled) return
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(PATTERN[kind])
  } catch {
    /* sin vibración: nada */
  }
}
