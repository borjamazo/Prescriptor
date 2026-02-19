# Signature Size Fix

## Issue
When signing a PDF, the app showed this error:
```
Insufficient space reserved for signature within DigitalSignatureField 
digital signature dictionary's Contents string.
Required space (bytes): 7833, available space (bytes): 7564
```

## Root Cause
The signature size reservation in `createSigDictForCustomSigning()` was set to 7500 bytes, but the actual CMS signature generated was 7833 bytes.

## Solution
Increased the reserved space from 7500 to 8500 bytes in `PdfSignerModule.kt`:

```kotlin
digsig.createSigDictForCustomSigning(
  "Adobe.PPKLite",
  DigitalSignatureField.SubFilterType.e_ETSI_CAdES_detached,
  8500  // Increased from 7500 to accommodate signature size
)
```

## Why This Happens
The signature size depends on:
- Certificate chain length (more certificates = larger signature)
- Certificate key size (RSA 2048 vs 4096 bits)
- PAdES attributes included
- Timestamp data (if included)

The actual signature for your certificate chain was 7833 bytes, so we now reserve 8500 bytes to provide a safety margin.

## Next Steps
1. Rebuild the app: `npm run android`
2. Try signing the PDF again
3. The signature should now save successfully

## Technical Note
From PDFTron documentation:
> For security reasons, set the contents size to a value greater than but as close as possible to the size you expect your final signature to be.

We've set it to 8500 bytes which provides:
- Enough space for the current signature (7833 bytes)
- ~667 bytes of safety margin
- Not excessively large (which could be a security concern)

If you encounter this error again with a different certificate, you may need to increase this value further based on the "Required space" shown in the error message.
