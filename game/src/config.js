// Dinner Table Dash — table, turkey and HUD constants.
// The whole escape happens on one Thanksgiving dinner table, 2600 px long,
// ending at the open window. The camera follows the turkey along it.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const TABLE_LEN = 2600;
export const TABLE_Y = 600; // top surface of the dinner table
export const WINDOW_X = 2440; // escape: the open window at the table's end
export const STEP = 1 / 60;
export const GRAVITY = 2400;
export const RUN_SPEED = 305;
export const DASH_SPEED = 640;
export const DASH_TIME = 0.28;
export const DASH_COOLDOWN = 2.0;
export const JUMP_VELOCITY = -860;
export const MAX_LIVES = 3;
export const BEST_KEY = 'dinner-table-dash-best';

// Warm Thanksgiving palette: wood, checkered cloth, porcelain, candlelight.
export const PALETTE = {
  wall: '#f3d9a4',
  wallLow: '#e8c88f',
  wainscot: '#b98a52',
  wood: '#8a5a2b',
  woodDark: '#6e451f',
  woodLight: '#a9743c',
  clothRed: '#c0392b',
  clothCream: '#f7ead2',
  plate: '#fdfbf4',
  plateRim: '#7fa8c9',
  glass: '#e8a33d',
  glassStem: '#c98a2e',
  gravy: '#8a5a1e',
  cranberry: '#a31621',
  stuffing: '#d9a441',
  candleWax: '#f5e6c8',
  flame: '#ff9d2e',
  flameCore: '#ffe08a',
  turkeyBody: '#7a4a21',
  turkeyLight: '#9c6632',
  feather: '#b5772f',
  featherTip: '#5d3a17',
  head: '#e8c39a',
  beak: '#e8862e',
  wattle: '#c0392b',
  leg: '#e8862e',
  farmerSkin: '#e8b88a',
  farmerShirt: '#3e6b8e',
  knifeBlade: '#dfe6ea',
  knifeHandle: '#4a2f1d',
  hand: '#e8b88a',
  hudBar: '#4a2f1d',
  hudText: '#fdf3d8',
  warn: '#d7263d',
  leaf: '#c96a1e',
};
