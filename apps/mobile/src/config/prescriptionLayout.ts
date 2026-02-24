/**
 * Configuration for prescription PDF text positioning.
 * Each page has 2 prescriptions (top and bottom).
 * Coordinates are in PDF points (1 point ≈ 0.35mm).
 * 
 * IMPORTANT: PDF coordinates start at BOTTOM-LEFT (0,0)
 * - Y=0 is at the BOTTOM
 * - Y increases UPWARD
 * - Standard A4: ~595 x 842 points
 */

export interface FieldPosition {
  x: number;
  y: number;
}

export interface PrescriptionFieldPositions {
  patientName: FieldPosition;
  patientDocument: FieldPosition;
  medication: FieldPosition;
  dosage: FieldPosition;
  instructions: FieldPosition;
}

export interface PrescriptionLayoutConfig {
  fontSize: number;
  
  // Positions for TOP prescription (first prescription on page)
  topPrescription: PrescriptionFieldPositions;
  
  // Positions for BOTTOM prescription (second prescription on page)
  bottomPrescription: PrescriptionFieldPositions;
  
  // Text wrapping
  maxCharsPerLine: number;
  instructionsMaxLines: number;
}

/**
 * Default layout configuration.
 * ADJUST THESE COORDINATES to match your prescription template.
 * 
 * To find correct positions:
 * 1. Open your prescription PDF
 * 2. Measure distances from bottom-left corner (in mm)
 * 3. Convert to points: points = mm × 2.83
 * 4. Update coordinates below
 */
export const DEFAULT_PRESCRIPTION_LAYOUT: PrescriptionLayoutConfig = {
  fontSize: 9,
  maxCharsPerLine: 50,
  instructionsMaxLines: 3,
  
  // TOP PRESCRIPTION (upper half of page)
  // Adjust these Y values - they should be in the upper half (Y > 421)
  topPrescription: {
    patientName: { x: 150, y: 700 },        // Nombre del paciente
    patientDocument: { x: 150, y: 680 },    // DNI/Documento
    medication: { x: 150, y: 640 },         // Medicamento
    dosage: { x: 150, y: 620 },             // Dosis
    instructions: { x: 150, y: 580 },       // Instrucciones/Posología
  },
  
  // BOTTOM PRESCRIPTION (lower half of page)
  // Adjust these Y values - they should be in the lower half (Y < 421)
  bottomPrescription: {
    patientName: { x: 150, y: 350 },        // Nombre del paciente
    patientDocument: { x: 150, y: 330 },    // DNI/Documento
    medication: { x: 150, y: 290 },         // Medicamento
    dosage: { x: 150, y: 270 },             // Dosis
    instructions: { x: 150, y: 230 },       // Instrucciones/Posología
  },
};

/**
 * Get the current layout configuration.
 */
export const getPrescriptionLayout = (): PrescriptionLayoutConfig => {
  return DEFAULT_PRESCRIPTION_LAYOUT;
};

/**
 * Helper to convert millimeters to PDF points.
 */
export const mmToPoints = (mm: number): number => {
  return mm * 2.83465;
};

/**
 * Helper to convert PDF points to millimeters.
 */
export const pointsToMm = (points: number): number => {
  return points / 2.83465;
};

/**
 * Determine if a prescription is in the top or bottom half of the page.
 * Each page has 2 prescriptions.
 * 
 * @param prescriptionIndex - Index within the block (0-based)
 * @returns 'top' or 'bottom'
 */
export const getPrescriptionPosition = (prescriptionIndex: number): 'top' | 'bottom' => {
  // Even indices (0, 2, 4...) are top prescriptions
  // Odd indices (1, 3, 5...) are bottom prescriptions
  return prescriptionIndex % 2 === 0 ? 'top' : 'bottom';
};

/**
 * Example: Measuring coordinates from your PDF
 * 
 * 1. Open PDF in a viewer that shows coordinates (Adobe Acrobat, etc.)
 * 2. Click on each field location
 * 3. Note the X,Y coordinates
 * 4. Remember: Y=0 is at BOTTOM, so subtract from page height if measuring from top
 * 
 * Example measurements for A4 (842 points height):
 * - Field at 50mm from top: Y = 842 - (50 × 2.83) = 842 - 141.5 = 700.5
 * - Field at 100mm from left: X = 100 × 2.83 = 283
 */
