# Birth Date Field & Duration Label Update

## Summary
1. Added a birth date field to the prescription creation form (positioned between patient name and document)
2. Changed "Dosis" label to "Duración" throughout the application

## Changes Made

### 1. Birth Date Field Implementation

#### `apps/mobile/src/services/PrescriptionService.ts`
- Updated `Prescription` interface to include `patientBirthDate: string`
- Updated `NewPrescriptionInput` interface to include `patientBirthDate: string`
- Modified `createPrescription()` to include `patientBirthDate` in the prescription object

#### `apps/mobile/src/screens/PrescriptionCreateScreen.tsx`
- Added `patientBirthDate` state variable
- Added `TextInputField` for birth date between name and document fields
  - Label: "Fecha de Nacimiento"
  - Placeholder: "DD/MM/AAAA"
  - Icon: "calendar-outline"
  - Keyboard type: "numeric"
- Updated preview section to display birth date with label "Fecha Nac.:"
- Updated form submission to include `patientBirthDate` in the input object

#### `apps/mobile/src/services/PrescriptionPdfService.ts`
- Updated `createPrescriptionPdf()` call to pass `prescription.patientBirthDate` as parameter

### 2. "Dosis" → "Duración" Label Changes

#### `apps/mobile/src/screens/PrescriptionCreateScreen.tsx`
- Changed label from "Dosis" to "Duración"
- Updated placeholder: "Ej., 7 días, 2 semanas, 1 mes"
- Updated helper text: "Especifica la duración del tratamiento"
- Updated preview label from "Dosis:" to "Duración:"
- Updated alert message: "Nombre del paciente, medicamento y duración son obligatorios"

#### `apps/mobile/src/config/prescriptionLayout.ts`
- Updated comments from "Dosis" to "Duración"

### 3. Kotlin/Android Changes

#### `apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt`

**Function Signature Updates:**
- `createPrescriptionPdf()`: Added `patientBirthDate: String` parameter
- `addPrescriptionDataToPage()`: Added `patientBirthDate: String` parameter
- `tryFillFormFields()`: Added `patientBirthDate: String` parameter
- `overlayPrescriptionText()`: Added `patientBirthDate: String` parameter

**Form Field Mapping:**
- Added birth date field patterns: "fecha_nacimiento", "birth_date", "birthdate", "nacimiento", "fecha_nac", "dob"
- Added duration field patterns: "duracion", "duration" (in addition to existing "dosis", "dosage", "dose", "cantidad")

**Documentation Updates:**
- Updated parameter description: "Treatment duration (e.g., 7 days, 2 weeks)"
- Updated log message: "Duration at ($dosX, $dosY)"

**PDF Coordinate Updates:**
- Adjusted Y-coordinates to accommodate birth date field
- Top prescription coordinates:
  - Patient Name: Y=700
  - Birth Date: Y=680 (NEW)
  - Document: Y=660 (adjusted from 680)
  - Medication: Y=620 (adjusted from 640)
  - Duration: Y=600 (adjusted from 620)
  - Instructions: Y=560 (adjusted from 580)
- Bottom prescription coordinates:
  - Patient Name: Y=350
  - Birth Date: Y=330 (NEW)
  - Document: Y=310 (adjusted from 330)
  - Medication: Y=270 (adjusted from 290)
  - Duration: Y=250 (adjusted from 270)
  - Instructions: Y=210 (adjusted from 230)

**Text Overlay Logic:**
- Added birth date rendering in `overlayPrescriptionText()`
- Birth date is displayed only if not empty
- Positioned between patient name and document

## Field Behavior

### Birth Date Field
- Optional (not required for form validation)
- Format: DD/MM/AAAA (user input, no automatic validation yet)
- Keyboard type: numeric for easier date entry
- Stored in prescription data model
- Included in PDF generation
- Displayed in preview section of create form

### Duration Field (formerly "Dosis")
- Required field (part of form validation)
- New placeholder examples: "7 días, 2 semanas, 1 mes"
- Helper text emphasizes treatment duration
- Variable name remains `dosage` in code for consistency

## Future Enhancements (Not Implemented)

1. Add date format validation (DD/MM/AAAA)
2. Add date picker UI component for better UX
3. Validate that date is in the past
4. Calculate age from birth date
5. Display birth date in PrescriptionCard (if needed)
6. Sync birth date to Supabase (if needed)

## Testing Checklist

- [ ] Create new prescription with birth date and duration
- [ ] Create new prescription without birth date (should work)
- [ ] Verify birth date appears in preview
- [ ] Verify "Duración" label appears correctly in form and preview
- [ ] Generate PDF and verify birth date is positioned correctly
- [ ] Generate PDF and verify duration field is positioned correctly
- [ ] Test with both top and bottom prescriptions on same page
- [ ] Verify form fields are filled if prescription template has birth date/duration fields
- [ ] Test on Android device

## Status

✅ Implementation complete
✅ Label change from "Dosis" to "Duración" complete
⚠️ Needs testing on device with actual prescription template
