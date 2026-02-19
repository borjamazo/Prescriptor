# Signature Validation Fix - Critical

## Problem
The PDF signature was being created but failing validation with:
```
Firma inválida
La verificación del valor de la firma no ha sido satisfactoria
```

The signature format was detected correctly as **PAdES B-Level** and all certificate information was present, but the cryptographic signature value was invalid.

## Root Cause

### The Issue
We were using `SHA256withRSA` to sign the digest, which was **double-hashing**:

```kotlin
// WRONG - Double hashing
val signature = java.security.Signature.getInstance("SHA256withRSA")
signature.update(signedAttrsDigest)  // Already SHA-256 hashed
val signatureValue = signature.sign()  // SHA256withRSA hashes AGAIN
```

### Why This Failed
1. PDFTron calculates: `signedAttrsDigest = SHA256(signedAttrs)`
2. We then used `SHA256withRSA` which does: `RSA(SHA256(signedAttrsDigest))`
3. This resulted in: `RSA(SHA256(SHA256(signedAttrs)))` ❌
4. But CMS expects: `RSA(SHA256(signedAttrs))` ✅

## Solution

### Use Raw RSA with DigestInfo
We now use `NONEwithRSA` (raw RSA encryption) with proper PKCS#1 DigestInfo structure:

```kotlin
// CORRECT - Sign the already-hashed digest
val signature = java.security.Signature.getInstance("NONEwithRSA")
signature.initSign(privateKey)

// Add PKCS#1 DigestInfo structure
val digestInfo = createDigestInfo(signedAttrsDigest)
signature.update(digestInfo)
val signatureValue = signature.sign()
```

### DigestInfo Structure
The `createDigestInfo()` method creates the proper PKCS#1 v1.5 structure:

```
DigestInfo ::= SEQUENCE {
  digestAlgorithm AlgorithmIdentifier {
    algorithm: SHA-256 OID (2.16.840.1.101.3.4.2.1)
    parameters: NULL
  },
  digest: OCTET STRING (the 32-byte SHA-256 hash)
}
```

This is the standard format required by RSA PKCS#1 v1.5 signatures.

## Technical Details

### What Changed
1. **Signature Algorithm**: `SHA256withRSA` → `NONEwithRSA`
2. **Input Data**: Raw digest → DigestInfo-wrapped digest
3. **Result**: Valid CMS signature that passes verification

### Why NONEwithRSA?
- `NONEwithRSA` performs raw RSA encryption without any hashing
- We manually add the DigestInfo structure (required by PKCS#1)
- This gives us full control over what gets signed
- The digest is already calculated by PDFTron's `calculateDigest()`

### PKCS#1 DigestInfo
The DigestInfo structure tells the verifier:
- Which hash algorithm was used (SHA-256)
- What the hash value is
- This is standard for RSA signatures per RFC 3447

## Verification

After this fix, the signature should:
- ✅ Pass cryptographic verification
- ✅ Show as valid in PDF readers
- ✅ Display correct signer information
- ✅ Maintain document integrity

## Testing

1. **Sign a PDF** with the updated app
2. **Open in Adobe Reader** or similar
3. **Check signature panel** - should show:
   - ✅ "Firma válida" (Valid signature)
   - ✅ Certificate details
   - ✅ Signing time
   - ✅ Document not modified

4. **Verify with online tools**:
   - Upload to PDF signature validators
   - Should pass all cryptographic checks

## Code Changes

### Before (Incorrect)
```kotlin
val signature = java.security.Signature.getInstance("SHA256withRSA")
signature.initSign(privateKey)
signature.update(signedAttrsDigest)  // Double hashing!
val signatureValue = signature.sign()
```

### After (Correct)
```kotlin
val signature = java.security.Signature.getInstance("NONEwithRSA")
signature.initSign(privateKey)
val digestInfo = createDigestInfo(signedAttrsDigest)
signature.update(digestInfo)
val signatureValue = signature.sign()
```

## Why This Matters

### Security
- Proper signature validation is critical for document authenticity
- Invalid signatures are worse than no signatures
- Recipients must be able to verify the signature

### Compliance
- PAdES (PDF Advanced Electronic Signatures) standard
- eIDAS compliance for European digital signatures
- Legal validity of signed documents

### Trust
- Valid signatures build trust
- Invalid signatures raise red flags
- Proper implementation is essential

## Related Standards

- **PKCS#1 v1.5**: RSA signature scheme (RFC 3447)
- **CMS**: Cryptographic Message Syntax (RFC 5652)
- **PAdES**: PDF Advanced Electronic Signatures (ETSI EN 319 142)
- **eIDAS**: European electronic identification regulation

## Next Steps

1. **Reinstall the app**: `npm run android`
2. **Sign a test PDF**
3. **Verify the signature** in a PDF reader
4. **Confirm validation passes**

The signature should now be cryptographically valid and pass all verification checks.

## References

- [PKCS#1 v1.5 Signature Scheme](https://datatracker.ietf.org/doc/html/rfc3447#section-8.2)
- [CMS Signature Format](https://datatracker.ietf.org/doc/html/rfc5652)
- [PAdES Standard](https://www.etsi.org/deliver/etsi_en/319100_319199/31914201/01.01.01_60/en_31914201v010101p.pdf)
- [PDFTron Custom Signing](https://docs.apryse.com/android/guides/features/signature/custom-signing)
