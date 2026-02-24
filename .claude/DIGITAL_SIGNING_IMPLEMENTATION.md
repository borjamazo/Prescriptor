# Digital Prescription Signing Implementation

## Overview
Implemented complete digital signing flow for prescriptions using PAdES (PDF Advanced Electronic Signatures) standard. The system extracts a specific page from a prescription block PDF, adds patient data, and signs it digitally with the user's certificate.

## Implementation Details

### 1. Native Module (Kotlin)
**File**: `apps/mobile/android/app/src/main/java/com/pdfsignpoc/PdfSignerModule.kt`

#### New Method: `createPrescriptionPdf`
Creates a prescription PDF from a prescription block page with patient data overlay.

**Parameters**:
- `blockFileUri`: URI of the prescription block PDF
- `pageIndex`: 0-based page index to extract
- `password`: PDF password (if encrypted)
- `patientName`: Patient's full name
- `patientDocument`: Patient's document (DNI, etc.)
- `medication`: Medication name
- `dosage`: Dosage instructions
- `instructions`: Additional instructions/posology

**Process**:
1. Opens source PDF (prescription block) with password if needed
2. Creates new PDF document
3. Imports specific page from source using PageSet API (1-based Apryse page numbering)
4. Adds text overlay with prescription data using ElementWriter
5. Saves to cache directory
6. Returns file URI

**Text Overlay**:
- Positioned at bottom of page (starting at Y=100)
- Font: Helvetica, size 10
- Includes: patient name, document, medication, dosage, and instructions
- Instructions are wrapped at 80 characters per line

**API Notes**:
- Uses `PageSet` for page extraction: `PageSet(pageNum, pageNum)`
- Uses `insertPages(index, sourceDoc, pageSet, bookmarkMode, progressMonitor)`
- ElementWriter mode: `ElementWriter.e_overlay` (not `WriteMode.e_overlay`)
- Font creation: `Font.create(doc, Font.e_helvetica)` (not `StandardType1Font.e_helvetica`)

### 2. Service Layer (TypeScript)
**File**: `apps/mobile/src/services/PrescriptionPdfService.ts`

#### Method: `createAndSignPrescription`
Orchestrates the complete prescription creation and signing flow.

**Process**:
1. Retrieves prescription block data
2. Finds the page index for the prescription from block history
3. Decrypts password if needed
4. Calls native `createPrescriptionPdf` to create PDF with patient data
5. Calls native `signPdf` to sign with PAdES digital signature
6. Returns signed PDF URI

**Additional Methods**:
- `sharePrescription(pdfUri)`: Share signed PDF via system share sheet
- `openPrescription(pdfUri)`: Open signed PDF in default PDF viewer

### 3. UI Integration
**File**: `apps/mobile/src/screens/HomeScreen.tsx`

#### Sign Handler
- Shows confirmation dialog with prescription details
- Sets loading state (`signingId`) to show spinner on card
- Calls `PrescriptionPdfService.createAndSignPrescription()`
- Updates prescription status to 'signed'
- Reloads data to refresh UI
- Shows success dialog with options to view or share PDF

**Loading State**:
- Tracks which prescription is being signed via `signingId`
- Passes to PrescriptionCard to show loading indicator
- Prevents multiple simultaneous signing operations

**File**: `apps/mobile/src/components/PrescriptionCard.tsx`

#### Loading State Display
- Added `isSigning` prop to show loading state
- Sign button shows spinner and "Firmando..." text when signing
- Button is disabled during signing to prevent duplicate operations
- Visual feedback with reduced opacity

## Security Considerations

1. **Temporary Files**: Created prescription PDFs are stored in app cache directory (private)
2. **Password Handling**: Passwords are decrypted only when needed and not stored in created PDFs
3. **Certificate Selection**: User must select certificate via Android KeyChain
4. **PAdES Compliance**: Signatures use ETSI CAdES detached format for legal compliance

## Data Flow

```
User taps "Firmar" 
  → Confirmation dialog
  → Get prescription block data
  → Find page index from block history
  → createPrescriptionPdf (native)
    → Extract page from block PDF
    → Add patient data overlay
    → Save to cache
  → signPdf (native)
    → User selects certificate
    → Sign with PAdES
    → Save to Downloads
  → Update prescription status to 'signed'
  → Sync to Supabase
  → Show success dialog
  → Option to view or share PDF
```

## Build Status

✅ Kotlin compilation successful
✅ App builds and installs on devices
✅ All TypeScript files have no diagnostics

## Testing Checklist

- [ ] Create prescription from active block
- [ ] Sign prescription with certificate
- [ ] Verify PDF is created with correct page
- [ ] Verify patient data is visible on PDF
- [ ] Verify digital signature is valid (PAdES)
- [ ] Test with password-protected prescription blocks
- [ ] Test loading state during signing
- [ ] Test error handling for certificate cancellation
- [ ] Test view PDF after signing
- [ ] Test share PDF after signing
- [ ] Verify signed prescription syncs to Supabase

## Known Limitations

1. **Text Positioning**: Text overlay is positioned at fixed coordinates (bottom of page). May need adjustment based on prescription template layout.
2. **Certificate Cancellation**: If user cancels certificate selection, error is shown but could be handled more gracefully.
3. **Signature Field**: Currently creates invisible signature field at (0,0,0,0). Could be positioned visibly on the page.

## Future Enhancements

1. **Configurable Text Position**: Allow configuration of where patient data appears on the page
2. **Visible Signature Field**: Add visible signature appearance on the prescription
3. **Batch Signing**: Sign multiple prescriptions at once
4. **Signature Verification**: Add UI to verify signature validity
5. **PDF Preview**: Show preview before signing
6. **Custom Templates**: Support different prescription templates with different layouts

## Troubleshooting

### Compilation Errors Fixed

1. **insertPages API**: Changed to use simpler deprecated API that works
   - Error: `None of the following candidates is applicable`
   - Solution: Use `insertPages(index, sourceDoc, startPage, endPage, flag, progressMonitor)`
   - Code: `newDoc.insertPages(0, sourceDoc, aprysePageNum, aprysePageNum, 0, null)`
   - Note: This API is deprecated but functional. PageSet API has compatibility issues.

2. **ElementWriter.WriteMode**: Enum is directly on ElementWriter class
   - Old: `ElementWriter.WriteMode.e_overlay`
   - New: `ElementWriter.e_overlay`

3. **Font.StandardType1Font**: Enum is directly on Font class
   - Old: `Font.StandardType1Font.e_helvetica`
   - New: `Font.e_helvetica`

4. **Page.doc**: Not a property, document passed as parameter
   - Solution: Pass PDFDoc as parameter to `addPrescriptionDataToPage()`

### Known Issues

1. **PDFNet Demo Mode**: When using trial/demo license, you'll see:
   ```
   Bad License Key. PDFNet SDK will work in demo mode.
   ```
   This is expected for trial versions. The functionality still works but may add watermarks or have limitations.

2. **Deprecated API**: The `insertPages(int, PDFDoc, int, int, int, ProgressMonitor)` method is deprecated but necessary for compatibility. Future versions should migrate to PageSet API when compatibility issues are resolved.

