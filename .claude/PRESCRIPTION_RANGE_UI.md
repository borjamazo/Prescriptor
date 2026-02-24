# Prescription Range UI Update

## Summary
Updated the BlockCard UI to display the prescription range (first to last) instead of just showing the first prescription number.

## Changes Made

### 1. Updated BlockCard Component
**File**: `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx`

- Added calculation of first and last prescription serials:
  ```typescript
  const firstSerial = PrescriptionBlockService.computeSerial(block.blockSerial, 0);
  const lastSerial = PrescriptionBlockService.computeSerial(block.blockSerial, block.totalRecetas - 1);
  ```

- Updated serial display section to show range:
  - Changed label from "Serie del bloque" to "Recetas del talonario"
  - Display format: `29-8448968 → 29-8448992` (first → last)
  - More intuitive for users to understand the prescription range

### 2. Updated Styles
- Modified `serialRow` to use `flex-start` alignment for better multi-line support
- Added `serialContent` wrapper for label and value
- Adjusted spacing and typography for better readability

## How It Works

The prescription numbering system is now fully implemented:

1. **Import**: User enters the FIRST prescription number (e.g., "29-8448968")
2. **Storage**: `blockSerial` stores this first number
3. **Calculation**: Each page gets consecutive number:
   - Page 0 (first) = 29-8448968
   - Page 1 = 29-8448969
   - Page 2 = 29-8448970
   - etc.
4. **Display**: Card shows full range (first → last)
5. **Usage**: When marking as used, correct serial is computed based on page index

## User Experience

Before:
```
Serie del bloque: 29-8448968
```

After:
```
Recetas del talonario
29-8448968 → 29-8448992
```

This makes it immediately clear:
- What the first prescription number is
- What the last prescription number is
- The total range of prescriptions in the block

## Related Files
- `apps/mobile/src/services/PrescriptionBlockService.ts` - Contains `computeSerial()` logic
- `apps/mobile/src/screens/PrescriptionBlocksScreen.tsx` - UI implementation

## Status
✅ Complete - UI now properly displays prescription ranges
