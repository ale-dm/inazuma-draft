import type { CSSProperties } from 'react'
import type { Element, Special } from '../types'
import { getTechnique, hyperName, specialName } from '../data/catalog'
import { useAppSettings } from '../context/AppSettings'
import { ARMOUR, MIXI, armourDrain, auraCost, poolMax, poolUnit } from '../lib/tension'
import TechBlock, { EL_NUM } from './TechBlock'

/** Tipo de aura → placa (plate_<x>_<el>.png) e icono de categoría (icon_sp_areaNN.png) del juego */
const PLATE: Record<Special['type'], string> = { keshin: 'fs', soul: 'soul', mixi: 'mixi' }
const ICON: Record<Special['type'], string> = { keshin: '05', mixi: '07', soul: '08' }

const plateStyle = (kind: string, el: number) => ({ '--plate': `url('/icons/plate_${kind}_${el}.png')` }) as CSSProperties

/**
 * Aura de una carta (espíritu guerrero, tótem o Mixi Max) como en el juego: placa con su icono y nombre, la reserva de
 * puntos de aura (PEG / SP / PE), su técnica con el TP y cuántas veces se puede usar, y la armadura si la tiene.
 * Reglas y números: lib/tension.ts y docs/balance-tecnicas-auras.md.
 */
export default function AuraBlock({ sp, element }: { sp: Special; element: Element }) {
  const { t, locale } = useAppSettings()
  const tech = sp.hyper_id ? getTechnique(sp.hyper_id) : undefined
  const el = EL_NUM[tech?.element ?? element] ?? 5
  const unit = poolUnit(sp)
  const pool = poolMax(sp)
  const cost = auraCost(sp)
  const uses = Math.floor(pool / cost)

  return (
    <div className={`aura aura--${sp.type}`}>
      <div className="aura__head" style={plateStyle(PLATE[sp.type], el)}>
        <img className="aura__icon" src={`/icons/icon_sp_area${ICON[sp.type]}.png`} alt="" />
        <span className="aura__title">
          <small>{t(`special.${sp.type}`)}</small>
          <b>{specialName(sp, locale)}</b>
        </span>
        <span className="aura__pool"><small>{unit}</small>{pool}</span>
      </div>

      <div className="aura__body">
        {tech
          ? <TechBlock tech={tech} />
          : sp.hyper && <span className="aura__hyper">{hyperName(sp, locale)}</span>}
        <ul className="aura__facts">
          {sp.type === 'mixi' ? (
            <>
              <li><span>{t('aura.cost')}</span><b>{cost} {unit}</b></li>
              <li><span>{t('aura.bonus')}</span><b>+{MIXI.bonus}</b></li>
            </>
          ) : (sp.hyper || tech) && (
            <li><span>{t('aura.cost')}</span><b>{cost} {unit}</b></li>
          )}
          <li><span>{t('aura.uses')}</span><b>×{uses}</b></li>
        </ul>
      </div>

      {sp.type === 'keshin' && sp.armed && (
        <div className="aura__head aura__head--armed" style={plateStyle('fsa', el)}>
          <img className="aura__icon" src="/icons/icon_sp_area06.png" alt="" />
          <span className="aura__title">
            <small>{t('special.armed')}</small>
            <b>+{ARMOUR.bonus} · {t('aura.armedFree')}</b>
          </span>
          <span className="aura__pool"><small>{unit}/{t('aura.turn')}</small>{armourDrain(sp)}</span>
        </div>
      )}
    </div>
  )
}
