/**
 * DEBUG CONFIGURATION
 * 
 * Set DEBUG_PRESCRIPTION_POSITIONING to true to enable debugging tools:
 * - "Regenerar PDF" button on prescription cards
 * - "Compartir" button to share PDF without signing
 * - Allows testing coordinate positioning without signing
 * 
 * SET TO FALSE IN PRODUCTION!
 */

export const DEBUG_PRESCRIPTION_POSITIONING = true;

/**
 * When debugging is enabled, these features are available:
 * - Regenerate PDF from prescription data
 * - Share PDF directly without signing
 * - Test coordinate positioning quickly
 */
export const isDebugMode = () => DEBUG_PRESCRIPTION_POSITIONING;
