<script setup>
/**
 * L3MascotAnimated
 * Layered vector SVG mascot matching the L3-Bot design with 60fps CSS animations
 * per expression state: 'idle' | 'hi' | 'explain' | 'happy' | 'sad'.
 * Supports dynamic suit/visor accents for the Dynamic Theme Engine (PRD F-04).
 */
import { computed, useId } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'idle',
  },
  suitColor: {
    type: String,
    default: '#DC2626',
  },
  suitShadeColor: {
    type: String,
    default: '#B91C1C',
  },
})

const uid = useId()

const stateClass = computed(() => {
  const v = props.variant
  if (v === 'hi' || v === 'explain') return 'is-hi'
  if (v === 'happy') return 'is-happy'
  if (v === 'sad') return 'is-sad'
  return 'is-idle'
})

const isHappy = computed(() => props.variant === 'happy')
const isSad = computed(() => props.variant === 'sad')
</script>

<template>
  <svg
    viewBox="36 22 440 464"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="l3-mascot w-full h-full select-none overflow-visible"
    :class="stateClass"
    role="img"
    :aria-label="`Maskot L3 ekspresi ${variant}`"
  >
    <defs>
      <!-- Yellow-orange glowing eye gradient -->
      <linearGradient :id="`eyeGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FEF08A" />
        <stop offset="55%" stop-color="#FACC15" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>

      <!-- Visor glass sheen -->
      <linearGradient :id="`visorGrad-${uid}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.42" />
        <stop offset="50%" stop-color="#0EA5E9" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#22D3EE" stop-opacity="0.38" />
      </linearGradient>

      <!-- White helmet inner depth -->
      <linearGradient :id="`helmetGrad-${uid}`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="78%" stop-color="#F1F5F9" />
        <stop offset="100%" stop-color="#CBD5E1" />
      </linearGradient>

      <!-- Eye glow -->
      <filter :id="`eyeGlow-${uid}`" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <!-- Soft ground shadow -->
    <ellipse cx="256" cy="474" rx="88" ry="12" fill="#000000" fill-opacity="0.35" class="l3-shadow" />

    <!-- Whole character rig -->
    <g class="l3-body-rig">
      <!-- ── LEGS & BOOTS ── -->
      <g class="l3-legs">
        <!-- Pelvis joint -->
        <rect x="198" y="372" width="116" height="30" rx="8" fill="#26292E" stroke="#0F1115" stroke-width="11" />

        <!-- Left boot -->
        <g class="l3-leg-left">
          <rect x="180" y="388" width="70" height="30" rx="6" :fill="suitColor" stroke="#0F1115" stroke-width="11" stroke-linejoin="round" />
          <path d="M180 416 H250 L244 456 H186 Z" :fill="suitShadeColor" stroke="#0F1115" stroke-width="11" stroke-linejoin="round" />
        </g>

        <!-- Right boot -->
        <g class="l3-leg-right">
          <rect x="262" y="388" width="70" height="30" rx="6" :fill="suitColor" stroke="#0F1115" stroke-width="11" stroke-linejoin="round" />
          <path d="M262 416 H332 L326 456 H268 Z" :fill="suitShadeColor" stroke="#0F1115" stroke-width="11" stroke-linejoin="round" />
        </g>
      </g>

      <!-- ── LEFT ARM (viewer's left) ── -->
      <g class="l3-arm-left">
        <!-- Charcoal ball hand -->
        <circle cx="122" cy="364" r="22" fill="#2B2E33" stroke="#0F1115" stroke-width="11" />
        <!-- Red armored sleeve -->
        <path
          d="M174 300 L124 342 L144 366 L192 326 Z"
          :fill="suitColor"
          stroke="#0F1115"
          stroke-width="11"
          stroke-linejoin="round"
        />
        <!-- Armor joint stripe -->
        <path d="M144 326 L160 348" stroke="#0F1115" stroke-width="8" stroke-linecap="round" />
      </g>

      <!-- ── RIGHT ARM (viewer's right) ── -->
      <g class="l3-arm-right">
        <!-- Charcoal ball hand -->
        <circle cx="390" cy="364" r="22" fill="#2B2E33" stroke="#0F1115" stroke-width="11" />
        <!-- Red armored sleeve -->
        <path
          d="M338 300 L388 342 L368 366 L320 326 Z"
          :fill="suitColor"
          stroke="#0F1115"
          stroke-width="11"
          stroke-linejoin="round"
        />
        <!-- Armor joint stripe -->
        <path d="M368 326 L352 348" stroke="#0F1115" stroke-width="8" stroke-linecap="round" />
      </g>

      <!-- ── TORSO & L3 LOGO ── -->
      <g class="l3-torso">
        <path
          d="M176 296 H336 L324 382 H188 Z"
          :fill="suitColor"
          stroke="#0F1115"
          stroke-width="12"
          stroke-linejoin="round"
        />
        <!-- Subtle side shadow -->
        <path d="M312 302 H330 L320 376 H304 Z" :fill="suitShadeColor" opacity="0.55" />

        <!-- L3 Chest Emblem -->
        <g transform="translate(228, 316)">
          <!-- Geometric L -->
          <path d="M4 4 H15 V35 H28 V44 H0 Z" fill="#FFFFFF" transform="skewX(-7)" />
          <!-- Geometric 3 -->
          <path d="M34 4 H58 V44 H33 V35 H47 V28 H36 V20 H47 V13 H34 Z" fill="#FFFFFF" transform="skewX(-7)" />
        </g>
      </g>

      <!-- ── HEAD GROUP ── -->
      <g class="l3-head">
        <!-- Left Antenna + Spinning Propeller -->
        <g class="l3-antenna-left">
          <path d="M168 114 L176 92 H202 L208 114 Z" :fill="suitColor" stroke="#0F1115" stroke-width="10" stroke-linejoin="round" />
          <line x1="189" y1="92" x2="189" y2="56" stroke="#0F1115" stroke-width="9" stroke-linecap="round" />

          <!-- Spinning sky-blue propeller blade -->
          <g class="l3-propeller">
            <rect x="98" y="69" width="182" height="19" rx="9.5" fill="#67D4FA" stroke="#0F1115" stroke-width="8" />
          </g>

          <!-- Red ball tip -->
          <circle cx="189" cy="54" r="14" :fill="suitColor" stroke="#0F1115" stroke-width="9" />
          <circle cx="184" cy="49" r="3.5" fill="#FFFFFF" opacity="0.85" />
        </g>

        <!-- Right Antenna -->
        <g class="l3-antenna-right">
          <path d="M298 114 L304 92 H330 L338 114 Z" :fill="suitColor" stroke="#0F1115" stroke-width="10" stroke-linejoin="round" />
          <line x1="317" y1="92" x2="317" y2="54" stroke="#0F1115" stroke-width="9" stroke-linecap="round" />
          <circle cx="317" cy="52" r="14" :fill="suitColor" stroke="#0F1115" stroke-width="9" />
          <circle cx="312" cy="47" r="3.5" fill="#FFFFFF" opacity="0.85" />
        </g>

        <!-- White Monitor/Helmet Frame -->
        <rect
          x="120"
          y="112"
          width="272"
          height="190"
          rx="54"
          :fill="`url(#helmetGrad-${uid})`"
          stroke="#0F1115"
          stroke-width="13"
        />

        <!-- Top Dark Cap / Sensor Bar -->
        <rect
          x="176"
          y="98"
          width="160"
          height="32"
          rx="10"
          fill="#1F2227"
          stroke="#0F1115"
          stroke-width="10"
        />

        <!-- Inner Dark Screen -->
        <rect
          x="150"
          y="134"
          width="212"
          height="146"
          rx="32"
          fill="#16191E"
          stroke="#0F1115"
          stroke-width="8"
        />

        <!-- ── FACE EXPRESSIONS (INSIDE SCREEN) ── -->
        <g class="l3-face">
          <!-- Happy Eyes (^ ^) -->
          <g v-if="isHappy" :filter="`url(#eyeGlow-${uid})`">
            <path
              d="M179 205 Q203 176 227 205"
              stroke="#FDE047"
              stroke-width="12"
              stroke-linecap="round"
              fill="none"
            />
            <path
              d="M285 205 Q309 176 333 205"
              stroke="#FDE047"
              stroke-width="12"
              stroke-linecap="round"
              fill="none"
            />
          </g>

          <!-- Sad Eyes (cute droopy half-moons) -->
          <g v-else-if="isSad" :filter="`url(#eyeGlow-${uid})`">
            <path
              d="M183 196 L223 188 A21 21 0 1 1 183 196 Z"
              :fill="`url(#eyeGrad-${uid})`"
            />
            <path
              d="M329 196 L289 188 A21 21 0 1 0 329 196 Z"
              :fill="`url(#eyeGrad-${uid})`"
            />
          </g>

          <!-- Idle & Hi/Explain Glowing Oval Eyes (with blink) -->
          <g v-else class="l3-eyes-blink" :filter="`url(#eyeGlow-${uid})`">
            <ellipse cx="203" cy="197" rx="19" ry="26" :fill="`url(#eyeGrad-${uid})`" />
            <ellipse cx="309" cy="197" rx="19" ry="26" :fill="`url(#eyeGrad-${uid})`" />
            <circle cx="197" cy="186" r="5" fill="#FFFFFF" opacity="0.55" />
            <circle cx="303" cy="186" r="5" fill="#FFFFFF" opacity="0.55" />
          </g>

          <!-- Mouth / Beak -->
          <path
            v-if="isSad"
            d="M240 245 Q256 232 272 245"
            stroke="#F59E0B"
            stroke-width="7"
            stroke-linecap="round"
            fill="none"
          />
          <polygon
            v-else
            points="247,232 265,232 256,246"
            fill="#F59E0B"
            stroke="#EA580C"
            stroke-width="2"
            stroke-linejoin="round"
          />
        </g>

        <!-- Translucent Cyan Visor -->
        <path
          d="M138 164 L374 164 L358 228 L154 228 Z"
          :fill="`url(#visorGrad-${uid})`"
          stroke="#38BDF8"
          stroke-width="4.5"
          stroke-linejoin="round"
        />
        <!-- Visor specular glint -->
        <path d="M160 172 L205 172 L185 220 L166 220 Z" fill="#FFFFFF" opacity="0.1" />

        <!-- Animated Sweat Drop (Sad state only) -->
        <g v-if="isSad" class="l3-sweat">
          <path
            d="M342 150 C342 150 356 170 356 180 A14 14 0 1 1 328 180 C328 170 342 150 342 150 Z"
            fill="#67E8F9"
            stroke="#0284C7"
            stroke-width="3.5"
          />
          <circle cx="337" cy="180" r="3" fill="#FFFFFF" opacity="0.8" />
        </g>

        <!-- Happy Sparkles -->
        <g v-if="isHappy" class="l3-sparkles">
          <path d="M98 148 L103 136 L108 148 L120 153 L108 158 L103 170 L98 158 L86 153 Z" fill="#FDE047" />
          <path d="M408 134 L412 124 L416 134 L426 138 L416 142 L412 152 L408 142 L398 138 Z" fill="#38BDF8" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
/* ─── Transform Origins ────────────────────────────────────────────────────── */
.l3-body-rig { transform-origin: 256px 456px; }
.l3-head { transform-origin: 256px 296px; }
.l3-propeller { transform-origin: 189px 78px; }
.l3-eyes-blink { transform-origin: 256px 197px; }
.l3-arm-left { transform-origin: 180px 314px; }
.l3-arm-right { transform-origin: 332px 314px; }
.l3-shadow { transform-origin: 256px 474px; }
.l3-sweat { transform-origin: 342px 175px; }

/* ─── IDLE: Gentle hover/breathing + blinking + slow propeller spin ─────────── */
.is-idle .l3-body-rig {
  animation: l3-float 2.8s ease-in-out infinite;
}
.is-idle .l3-shadow {
  animation: l3-shadow-pulse 2.8s ease-in-out infinite;
}
.is-idle .l3-propeller {
  animation: l3-propeller-spin 0.9s linear infinite;
}
.is-idle .l3-eyes-blink {
  animation: l3-blink 4.2s ease-in-out infinite;
}
.is-idle .l3-arm-left {
  animation: l3-arm-idle-l 2.8s ease-in-out infinite;
}
.is-idle .l3-arm-right {
  animation: l3-arm-idle-r 2.8s ease-in-out infinite;
}

/* ─── HI / EXPLAIN: Friendly wave + slight head tilt + brisk propeller ───────── */
.is-hi .l3-body-rig {
  animation: l3-float 2.4s ease-in-out infinite;
}
.is-hi .l3-head {
  animation: l3-head-tilt 2.4s ease-in-out infinite;
}
.is-hi .l3-arm-left {
  transform: rotate(54deg);
  animation: l3-wave-left 1.1s ease-in-out infinite;
}
.is-hi .l3-propeller {
  animation: l3-propeller-spin 0.55s linear infinite;
}
.is-hi .l3-eyes-blink {
  animation: l3-blink 3.6s ease-in-out infinite;
}

/* ─── HAPPY: Cheerful bounce + raised arms wiggle + fast propeller ─────────── */
.is-happy .l3-body-rig {
  animation: l3-happy-bounce 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
}
.is-happy .l3-shadow {
  animation: l3-shadow-bounce 0.75s ease-in-out infinite;
}
.is-happy .l3-arm-left {
  transform: rotate(68deg);
  animation: l3-cheer-left 0.75s ease-in-out infinite;
}
.is-happy .l3-arm-right {
  transform: rotate(-68deg);
  animation: l3-cheer-right 0.75s ease-in-out infinite;
}
.is-happy .l3-propeller {
  animation: l3-propeller-spin 0.28s linear infinite;
}
.is-happy .l3-sparkles {
  animation: l3-twinkle 1.1s ease-in-out infinite;
}

/* ─── SAD: Drooping slump + gentle tremble + falling sweat drop ─────────────── */
.is-sad .l3-body-rig {
  animation: l3-sad-slump 2.2s ease-in-out infinite;
}
.is-sad .l3-head {
  animation: l3-sad-head 2.2s ease-in-out infinite;
}
.is-sad .l3-arm-left {
  transform: rotate(-10deg);
}
.is-sad .l3-arm-right {
  transform: rotate(10deg);
}
.is-sad .l3-propeller {
  animation: l3-propeller-spin 2.8s linear infinite;
}
.is-sad .l3-sweat {
  animation: l3-sweat-drop 1.6s ease-in infinite;
}

/* ─── Keyframes ────────────────────────────────────────────────────────────── */
@keyframes l3-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-7px); }
}

@keyframes l3-shadow-pulse {
  0%, 100% { transform: scaleX(1); opacity: 0.35; }
  50% { transform: scaleX(0.9); opacity: 0.24; }
}

@keyframes l3-propeller-spin {
  0% { transform: scaleX(1); }
  25% { transform: scaleX(0.2); }
  50% { transform: scaleX(1); }
  75% { transform: scaleX(0.2); }
  100% { transform: scaleX(1); }
}

@keyframes l3-blink {
  0%, 44%, 48%, 94%, 100% { transform: scaleY(1); }
  46%, 96% { transform: scaleY(0.08); }
}

@keyframes l3-arm-idle-l {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(4deg); }
}

@keyframes l3-arm-idle-r {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-4deg); }
}

@keyframes l3-head-tilt {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(3deg); }
}

@keyframes l3-wave-left {
  0%, 100% { transform: rotate(46deg); }
  50% { transform: rotate(72deg); }
}

@keyframes l3-happy-bounce {
  0%, 100% { transform: translateY(0px) scale(1, 1); }
  20% { transform: translateY(4px) scale(1.04, 0.96); }
  55% { transform: translateY(-16px) scale(0.98, 1.03); }
}

@keyframes l3-shadow-bounce {
  0%, 100% { transform: scaleX(1); opacity: 0.38; }
  55% { transform: scaleX(0.76); opacity: 0.18; }
}

@keyframes l3-cheer-left {
  0%, 100% { transform: rotate(58deg); }
  50% { transform: rotate(78deg); }
}

@keyframes l3-cheer-right {
  0%, 100% { transform: rotate(-58deg); }
  50% { transform: rotate(-78deg); }
}

@keyframes l3-twinkle {
  0%, 100% { opacity: 0.95; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.85); }
}

@keyframes l3-sad-slump {
  0%, 100% { transform: translateY(3px) rotate(0deg); }
  25% { transform: translateY(5px) rotate(-1deg); }
  75% { transform: translateY(5px) rotate(1deg); }
}

@keyframes l3-sad-head {
  0%, 100% { transform: translateY(4px) rotate(-2deg); }
  50% { transform: translateY(7px) rotate(2deg); }
}

@keyframes l3-sweat-drop {
  0% { transform: translateY(-4px); opacity: 0; }
  25% { opacity: 1; }
  85% { transform: translateY(14px); opacity: 0.9; }
  100% { transform: translateY(18px); opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .l3-mascot * {
    animation: none !important;
  }
}
</style>
