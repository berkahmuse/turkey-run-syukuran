# Dinner Table Dash — @syukuran entry

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/berkahmuse/turkey-run-syukuran/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/berkahmuse/turkey-run-syukuran/reward.svg)](https://make.fun/c/turkey-run-game-01)

Entry for the [make.fun competition "Make the best turkey escape game"](https://make.fun/c/turkey-run-game-01)
(`turkey-run-game-01`): the turkey is already ON the Thanksgiving dinner
table, and the carving knife is already out. Run the length of the table —
over plates, glasses and the stuffing dish, past the candles — and slip out
the open window before the farmer's hand comes down.

## The game

Thanksgiving is coming, and you are dinner. The farmer carves from above,
so every slash is **telegraphed**: a red zone, a warning `!` and the hand
lowering the knife give you a beat to run, jump or gobble-dash clear.

- **← → / A D** — run, **SPACE / ↑ / W** — jump, **SHIFT** — gobble dash
  (burst of speed, 2 s cooldown), **P** — pause, **M** — mute, **R** — restart.
- **Dodge the carving knife** — red zone + hand means a slash is coming.
  Jump clears the blade at its peak; dash carries you out of the zone.
  Stand still too long and the farmer stops waiting: the knife comes for you.
- **Gravy puddles** slow you to a waddle. **Candle flames** burn.
  **Bread rolls** roll in from the right. Three hits and you are caught.
- **Grab cranberries** (+25, combo up to x5), **stuffing** (+50) and the
  golden **wishbone** (+150) on the way to the window.
- Title screen, live HUD (score, distance to the window, lives,
  cranberries, time, dash meter, combo, progress bar), and caught / escaped
  end screens with a restart. All art is flat vector drawn in code and all
  sound is a WebAudio synth; the game loads no network resource and plays
  offline.

## How it runs

`game/` is plain static files — open `game/index.html` from any static
server. Locally:

```sh
node serve.ts --port 8083   # game/ on http://localhost:8083
```

`main.ts` (Node 22+) hands the entry in: it copies `game/` and
`screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes
`/output/dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

No network, no secrets, no dependencies. The program ships everything it
runs.

## Build record

- Anchor: `makefun anchor 8d2a6dea2905cfc5ae5085f6a6c43fb740237513 round 6677221`
  (drand mainnet, quoted in the builder's session before its first write, 2026-11-27T02:47:54Z)
- Wallet: `xbSnHDzJbEHX7tBx34BZ8HjJ2PVgVnMq6HEKaYGTS4j` (account @syukuran)
- License: MIT
