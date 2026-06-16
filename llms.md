# 🧠 LLM System Context & Architectural Guide — FF6WC Ultima

This document provides a highly detailed systems-level architectural blueprint, domain definitions, and coding guidelines for the **FF6WC Ultima Monorepo**. It is designed to act as an immediate context injector for Large Language Models (LLMs) assisting with development on this codebase.

---

## 🏛️ System & Architecture Overview

FF6WC Ultima is a Final Fantasy VI Worlds Collide (randomizer) community platform. It coordinates web-based configuration creation with active Super Nintendo emulator auto-tracking using two Next.js applications and multiple shared npm workspaces.

```
                     ┌──────────────────────────────────────────────┐
                     │            @ff6wc/ultima Monorepo            │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
      ┌───────────────────────────┐                   ┌───────────────────────────┐
      │ apps/balance-and-ruin     │                   │ apps/tempest              │
      │ (Next.js Pages App)       │                   │ (Next.js Pages App)       │
      │ Randomizer Flag Creator   │                   │ Live ROM Auto-Tracker     │
      └─────────────┬─────────────┘                   └─────────────┬─────────────┘
                    │                                               │
                    │      ┌─────────────────────────────────┐      │
                    ├─────►│ @ff6wc/ui                       │◄─────┤
                    │      │ (Shared Tailwind UI Components) │      │
                    │      └─────────────────────────────────┘      │
                    │                                               │
                    │      ┌─────────────────────────────────┐      │
                    ├─────►│ @ff6wc/ff6-types                 │◄─────┤
                    │      │ (Character & Event Memory Maps) │      │
                    │      └─────────────────────────────────┘      │
                    │                                               │
                    │                                               │      ┌─────────────────────────────────┐
                    │                                               ├─────►│ @ff6wc/tracker-core             │
                    │                                               │      │ (SNI WebSocket API & Client)    │
                    │                                               │      └────────────────┬────────────────┘
                    ▼                                               ▼                       │
      ┌───────────────────────────┐                   ┌───────────────────────────┐         │
      │ Google Cloud Run (Narshe) │                   │ Super Nintendo Emulation  │◄────────┘
      │ https://narshe-dev-api... │                   │ (RetroArch, BizHawk, SNI) │ via WS
      └───────────────────────────┘                   └───────────────────────────┘
```

---

## 🔬 Subproject Breakdown

### 1. `apps/balance-and-ruin` (Flag Customizer)

A static Next.js frontend (pages router) used to generate final game seed configs via flags.

- **Redux Toolkit State**: Manages complex layout flag states (`state/flagSlice.ts`, `state/objectiveSlice.ts`).
- **Card components**: Interactive UI card groupings of flags (located in `card-components/`).
- **Static Export**: Runs `next build && next export` to deploy to Vercel.
- **Backend API Integration**: Connects to a Cloud Run service (`NEXT_PUBLIC_API_URL` -> `https://narshe-dev-695746955780.us-west1.run.app`) to dispatch seed generation jobs.

### 2. `apps/tempest` (Live Tracker UI)

A Next.js dashboard supporting auto-tracking of live SNES emulator sessions or manual mouse-click tracking.

- **Auto-Tracking Flow**: Leverages `@ff6wc/tracker-core` to establish local WebSockets connections to an SNI client, fetching ROM memory.
- **EmoTracker Dashboard**: Visual grids indicating obtained items, unlocked characters, defeated dragons, and completed game checks.

### 3. `packages/tracker-core` (Emulator Socket Connection)

A TypeScript wrapper for Super Nintendo emulator coordination.

- **Communication**: Opens client websockets to a Super Nintendo Interface (SNI) host listening on local ports `23074` or `8080`.
- **State Machine**: Wraps standard SNI JSON/binary frames (`Attach`, `Name`, `Info`, `GetAddress`, `PutAddress`) in a thread-safe execution queue.

### 4. `packages/ff6-types` (Final Fantasy VI Memory Blueprint)

Holds domain-level memory offsets, RAM bits, event structures, and character layout models. This package is the ultimate source of truth for the emulation data structure.

---

## 💾 Final Fantasy VI Save & Memory Domain Knowledge

To understand how auto-tracking functions, you must understand how Final Fantasy VI maps state to RAM buffers. All addresses and offsets are represented in hexadecimal and processed by `@ff6wc/ff6-types`.

### 🎮 Character Bitmasks (`packages/ff6-types/wc.ts`)

Unlocked characters are mapped dynamically to bit flags in the SRAM buffer starting from address `0x2e0`:

- **Offset Calculation**: `0x2e0 + characterIndex` (mapped to bit values inside RAM).
- **Indices Mapping**:
  | Index | Character | Index | Character |
  | :--- | :--- | :--- | :--- |
  | `0` | Terra | `7` | Strago |
  | `1` | Locke | `8` | Relm |
  | `2` | Cyan | `9` | Setzer |
  | `3` | Shadow | `10` | Mog |
  | `4` | Edgar | `11` | Gau |
  | `5` | Sabin | `12` | Gogo |
  | `6` | Celes | `13` | Umaro |

### 🚩 Event Bit Flags (`packages/ff6-types/_eventBits.ts` & `_npcBits.ts`)

Completing chest checks, defeating bosses, or finishing events toggles specific bits in the ROM save memory.

- **`CheckBit` Object**: Formulated as `CheckBit(key, displayName, bitCoordinate)`.
- **Bit Coordinate Conversion**:
  - `byteCoordinate = Math.floor(bitCoordinate / 8)`
  - `bitPosition = bitCoordinate % 8`
- **Crucial Coordinates**:
  - `GOT_RAIDEN = 948` (Ancient Castle clear state)
  - `DEFEATED_ATMAWEAPON = 413` (Floating Continent event clear)
  - `DEFEATED_MAGIMASTER = 369` (Fanatic's Tower completion)
  - `FREED_CELES = 305` (South Figaro Prisoner check completion)

---

## 🎨 Shared Components & Visual Palette Code Style

The monorepo uses a shared component system defined in `@ff6wc/ui`. Avoid rewriting custom raw inputs, switches, buttons, or sliders; instead import them directly from `@ff6wc/ui`:

```typescript
import { Button, Switch, Slider, Card, CodeBlock } from "@ff6wc/ui";
```

### Visual Styling Guidelines

- **Glassmorphism Overlay**: Combine transparent backdrop styling with high blur scales for overlays:
  ```css
  .overlay-background {
    background-color: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(12px);
  }
  ```
- **Color Schemes**: Use HSL and Tailwind utilities dynamically mapping responsive color borders (`border-slate-800`, `hover:border-pink-500`).
- **Animations**: All transitions and transformations should apply cubic-bezier or transition timers (`transition-all duration-300 ease-in-out`).

---

## 🧠 Redux & LocalStorage Lifecycle

1. **Randomizer Flag Management**:
   - Flag configurations are stored in Redux slices (`flagSlice.ts`).
   - On seed creation, properties compile into flag strings (e.g. `-cgp -sotw`) to dispatch to the backing backend API.
2. **Tracker Sync Cycles**:
   - Current tracker state is persisted to the local storage using key `"ff6wc-trackerdata"`.
   - On startup, `apps/tempest/components/EmoTracker/EmoTracker.tsx` reads `"ff6wc-trackerdata"` and initializes the UI grid values.
   - Auto-tracking executes loop queries via `SnesSession.send(new GetSaveDataQuery())` every `1500ms`, merging emulator RAM variables back into local storage and Redux states.

---

## 🎯 Code Quality & Build Checks

- **Code Formatting**: Prettier coordinates code styling. Ensure all edits maintain correct formatting by validating with `pnpm format`.
- **TypeScript Types**: Strict typing is enabled. Always declare input parameters, API responses, and custom structures clearly in appropriate `.ts`/`.d.ts` modules.
- **Turborepo Dependency Safety**: Never install cross-workspace imports directly. Always declare the internal project dependency in your `package.json` (`"@ff6wc/package": "workspace:*"`), and run `pnpm build` to compile intermediate bundle caches.
