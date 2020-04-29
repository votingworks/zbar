import bindings from 'bindings'

const addon = bindings('qrdetect')

/**
 * Copied from zbar.h.
 */
export enum zbar_orientation_e {
  ZBAR_ORIENT_UNKNOWN = -1 /**< unable to determine orientation */,
  ZBAR_ORIENT_UP = 0 /**< upright, read left to right */,
  ZBAR_ORIENT_RIGHT = 1 /**< sideways, read top to bottom */,
  ZBAR_ORIENT_DOWN = 2 /**< upside-down, read right to left */,
  ZBAR_ORIENT_LEFT = 3 /**< sideways, read bottom to top */,
}

/**
 * Represents the orientation of the symbol found within the image.
 */
export enum Orientation {
  /** Unable to determine orientation */
  Unknown = zbar_orientation_e.ZBAR_ORIENT_UNKNOWN,
  /** Upright, read left to right */
  Up = zbar_orientation_e.ZBAR_ORIENT_UP,
  /** Sideways, read top to bottom */
  Right = zbar_orientation_e.ZBAR_ORIENT_RIGHT,
  /** Upside-down, read right to left */
  Down = zbar_orientation_e.ZBAR_ORIENT_DOWN,
  /** Sideways, read bottom to top */
  Left = zbar_orientation_e.ZBAR_ORIENT_LEFT,
}

/**
 * Copied from zbar.h.
 */
export enum zbar_symbol_type_e {
  ZBAR_NONE = 0 /**< no symbol decoded */,
  ZBAR_PARTIAL = 1 /**< intermediate status */,
  ZBAR_EAN2 = 2 /**< GS1 2-digit add-on */,
  ZBAR_EAN5 = 5 /**< GS1 5-digit add-on */,
  ZBAR_EAN8 = 8 /**< EAN-8 */,
  ZBAR_UPCE = 9 /**< UPC-E */,
  ZBAR_ISBN10 = 10 /**< ISBN-10 (from EAN-13). @since 0.4 */,
  ZBAR_UPCA = 12 /**< UPC-A */,
  ZBAR_EAN13 = 13 /**< EAN-13 */,
  ZBAR_ISBN13 = 14 /**< ISBN-13 (from EAN-13). @since 0.4 */,
  ZBAR_COMPOSITE = 15 /**< EAN/UPC composite */,
  ZBAR_I25 = 25 /**< Interleaved 2 of 5. @since 0.4 */,
  ZBAR_DATABAR = 34 /**< GS1 DataBar (RSS). @since 0.11 */,
  ZBAR_DATABAR_EXP = 35 /**< GS1 DataBar Expanded. @since 0.11 */,
  ZBAR_CODABAR = 38 /**< Codabar. @since 0.11 */,
  ZBAR_CODE39 = 39 /**< Code 39. @since 0.4 */,
  ZBAR_PDF417 = 57 /**< PDF417. @since 0.6 */,
  ZBAR_QRCODE = 64 /**< QR Code. @since 0.10 */,
  ZBAR_SQCODE = 80 /**< SQ Code. @since 0.20.1 */,
  ZBAR_CODE93 = 93 /**< Code 93. @since 0.11 */,
  ZBAR_CODE128 = 128 /**< Code 128 */,

  /*
   * Please see _zbar_get_symbol_hash() if adding
   * anything after 128
   */

  /** mask for base symbol type.
   * @deprecated in 0.11, remove this from existing code
   */
  ZBAR_SYMBOL = 0x00ff,
  /** 2-digit add-on flag.
   * @deprecated in 0.11, a  = =ZBAR_EAN2 component is used for
   * 2-digit GS1 add-ons
   */
  ZBAR_ADDON2 = 0x0200,
  /** 5-digit add-on flag.
   * @deprecated in 0.11, a  = =ZBAR_EAN5 component is used for
   * 5-digit GS1 add-ons
   */
  ZBAR_ADDON5 = 0x0500,
  /** add-on flag mask.
   * @deprecated in 0.11, GS1 add-ons are represented using composite
   * symbols of type  = =ZBAR_COMPOSITE; add-on components use  = =ZBAR_EAN2
   * or  = =ZBAR_EAN5
   */
  ZBAR_ADDON = 0x0700,
}

/**
 * Represents which type of symbol was found.
 */
export enum SymbolType {
  QRCode = zbar_symbol_type_e.ZBAR_QRCODE,
}

/**
 * A relevant location within a found symbol.
 */
export interface SymbolLocation {
  x: number
  y: number
}

/**
 * A symbol, e.g. a QR code, found in an image.
 */
export interface Symbol {
  type: SymbolType
  data: Buffer
  orientation: Orientation
  locations: readonly SymbolLocation[]
  quality?: number
}

/**
 * Finds symbols in an image.
 *
 * @param data raw pixel data (RGBA)
 * @param width count of pixels wide
 * @param height count of pixels tall
 * @returns a list of symbols
 */
export function detect(
  data: Buffer | Uint8Array | Uint8ClampedArray,
  width: number,
  height: number
): readonly Symbol[] {
  return addon.detect(data, width, height)
}

export const versions = {
  /**
   * The version of ZBar compiled against.
   */
  zbar: addon.version as string,
}
