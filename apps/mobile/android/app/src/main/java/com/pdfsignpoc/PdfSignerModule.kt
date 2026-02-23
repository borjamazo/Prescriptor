package com.pdfsignpoc

import android.net.Uri
import android.provider.MediaStore
import android.os.Environment
import android.content.ClipData
import android.content.Intent
import android.media.MediaScannerConnection
import android.os.Build
import android.security.KeyChain
import android.security.KeyChainAliasCallback
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.pdftron.pdf.DigitalSignatureField
import com.pdftron.pdf.PDFDoc
import com.pdftron.pdf.PDFNet
import com.pdftron.pdf.Rect
import com.pdftron.pdf.Date
import com.pdftron.pdf.TextExtractor
import com.pdftron.pdf.annots.SignatureWidget
import com.pdftron.sdf.SDFDoc
import com.pdftron.crypto.DigestAlgorithm
import com.pdftron.crypto.AlgorithmIdentifier
import com.pdftron.crypto.ObjectIdentifier
import com.pdftron.crypto.X509Certificate as PDFTronX509Certificate
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.io.InputStream
import java.security.PrivateKey
import java.security.cert.X509Certificate
import java.util.concurrent.atomic.AtomicBoolean

class PdfSignerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  private val initialized = AtomicBoolean(false)

  override fun getName(): String = "PdfSigner"

  @ReactMethod
  fun sharePdf(uriString: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No active activity")
      return
    }
    if (uriString.isBlank()) {
      promise.reject("E_INVALID_INPUT", "Signed PDF uri is empty")
      return
    }
    try {
      val uri = Uri.parse(uriString)
      val intent = Intent(Intent.ACTION_SEND).apply {
        type = "application/pdf"
        putExtra(Intent.EXTRA_STREAM, uri)
        clipData = ClipData.newUri(activity.contentResolver, "signed_pdf", uri)
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      val chooser = Intent.createChooser(intent, "Share Signed PDF")
      activity.startActivity(chooser)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_SHARE", e.message, e)
    }
  }

  @ReactMethod
  fun sharePDF(uriString: String, promise: Promise) {
    sharePdf(uriString, promise)
  }

  @ReactMethod
  fun openPdf(uriString: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No active activity")
      return
    }
    if (uriString.isBlank()) {
      promise.reject("E_INVALID_INPUT", "Signed PDF uri is empty")
      return
    }
    try {
      val uri = Uri.parse(uriString)
      val intent = Intent(Intent.ACTION_VIEW).apply {
        setDataAndType(uri, "application/pdf")
        addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }
      activity.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_OPEN", e.message, e)
    }
  }

  @ReactMethod
  fun openPDF(uriString: String, promise: Promise) {
    openPdf(uriString, promise)
  }

  @ReactMethod
  fun signPdf(inputPdfPath: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null) {
      promise.reject("E_NO_ACTIVITY", "No active activity")
      return
    }

    if (inputPdfPath.isBlank()) {
      promise.reject("E_INVALID_INPUT", "Input PDF path is empty")
      return
    }

    activity.runOnUiThread {
      KeyChain.choosePrivateKeyAlias(
        activity,
        KeyChainAliasCallback { alias ->
          if (alias == null) {
            promise.reject("E_CANCELLED", "User cancelled certificate selection")
            return@KeyChainAliasCallback
          }

          Thread {
            try {
              ensurePdfNetInitialized()
              val privateKey = KeyChain.getPrivateKey(activity, alias)
              val certChain = KeyChain.getCertificateChain(activity, alias)
              if (privateKey == null || certChain == null || certChain.isEmpty()) {
                promise.reject("E_KEYCHAIN", "Failed to retrieve certificate chain")
                return@Thread
              }

              val inputFile = resolveInputToFile(inputPdfPath)
              if (!inputFile.exists()) {
                promise.reject("E_INPUT", "Input PDF not found")
                return@Thread
              }

              val tempOutputFile = File(reactApplicationContext.filesDir, "signed_${System.currentTimeMillis()}.pdf")
              signWithApryse(inputFile.absolutePath, tempOutputFile.absolutePath, privateKey, certChain)
              val downloadUri = saveToDownloads(tempOutputFile)
              promise.resolve(downloadUri.toString())
            } catch (e: Exception) {
              promise.reject("E_SIGN", e.message, e)
            }
          }.start()
        },
        null,
        null,
        null,
        -1,
        null,
      )
    }
  }

  private fun ensurePdfNetInitialized() {
    if (initialized.compareAndSet(false, true)) {
      // Initialize PDFNet with trial/demo mode (empty license)
      PDFNet.initialize("")
    }
  }

  private fun resolveInputToFile(input: String): File {
    val uri = Uri.parse(input)
    return when (uri.scheme) {
      null, "file" -> File(uri.path ?: input)
      "content" -> copyContentUriToCache(uri)
      else -> File(input)
    }
  }

  private fun copyContentUriToCache(uri: Uri): File {
    val outputFile = File(reactApplicationContext.cacheDir, "input_${System.currentTimeMillis()}.pdf")
    val inputStream = reactApplicationContext.contentResolver.openInputStream(uri)
      ?: throw IllegalStateException("Unable to open content URI")
    inputStream.use { input ->
      FileOutputStream(outputFile).use { output ->
        copyStream(input, output)
      }
    }
    return outputFile
  }

  private fun copyStream(input: InputStream, output: FileOutputStream) {
    val buffer = ByteArray(16 * 1024)
    var read: Int
    while (true) {
      read = input.read(buffer)
      if (read <= 0) {
        break
      }
      output.write(buffer, 0, read)
    }
  }

  private fun copyStream(input: InputStream, output: OutputStream) {
    val buffer = ByteArray(16 * 1024)
    var read: Int
    while (true) {
      read = input.read(buffer)
      if (read <= 0) {
        break
      }
      output.write(buffer, 0, read)
    }
  }

  private fun saveToDownloads(sourceFile: File): Uri {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      saveToDownloadsScoped(sourceFile)
    } else {
      saveToDownloadsLegacy(sourceFile)
    }
  }

  private fun saveToDownloadsScoped(sourceFile: File): Uri {
    val resolver = reactApplicationContext.contentResolver
    val baseName = "file_signed"
    val extension = ".pdf"
    val downloadsPath = Environment.DIRECTORY_DOWNLOADS
    val displayName = findAvailableDownloadName(baseName, extension, downloadsPath)

    val values = android.content.ContentValues().apply {
      put(MediaStore.MediaColumns.DISPLAY_NAME, displayName)
      put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
      put(MediaStore.MediaColumns.RELATIVE_PATH, downloadsPath)
      put(MediaStore.Downloads.IS_PENDING, 1)
    }

    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
      ?: throw IllegalStateException("Unable to create download entry")

    resolver.openOutputStream(uri)?.use { output ->
      sourceFile.inputStream().use { input ->
        copyStream(input, output)
      }
    } ?: throw IllegalStateException("Unable to open download output stream")

    val doneValues = android.content.ContentValues().apply {
      put(MediaStore.Downloads.IS_PENDING, 0)
    }
    resolver.update(uri, doneValues, null, null)

    sourceFile.delete()
    return uri
  }

  private fun saveToDownloadsLegacy(sourceFile: File): Uri {
    val baseName = "file_signed"
    val extension = ".pdf"
    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
    val displayName = findAvailableLegacyName(baseName, extension, downloadsDir)
    val outputFile = File(downloadsDir, displayName)

    sourceFile.inputStream().use { input ->
      FileOutputStream(outputFile).use { output ->
        copyStream(input, output)
      }
    }

    MediaScannerConnection.scanFile(
      reactApplicationContext,
      arrayOf(outputFile.absolutePath),
      arrayOf("application/pdf"),
      null,
    )

    sourceFile.delete()
    return Uri.fromFile(outputFile)
  }

  private fun findAvailableDownloadName(baseName: String, extension: String, relativePath: String): String {
    var index = 0
    while (true) {
      val name = if (index == 0) {
        "$baseName$extension"
      } else {
        "$baseName ($index)$extension"
      }
      if (!downloadNameExists(name, relativePath)) {
        return name
      }
      index += 1
    }
  }

  private fun downloadNameExists(displayName: String, relativePath: String): Boolean {
    val resolver = reactApplicationContext.contentResolver
    val projection = arrayOf(MediaStore.MediaColumns._ID)
    val selection = "${MediaStore.MediaColumns.DISPLAY_NAME}=? AND ${MediaStore.MediaColumns.RELATIVE_PATH}=?"
    val selectionArgs = arrayOf(displayName, "$relativePath/")
    resolver.query(MediaStore.Downloads.EXTERNAL_CONTENT_URI, projection, selection, selectionArgs, null)
      ?.use { cursor ->
        return cursor.count > 0
      }
    return false
  }

  private fun findAvailableLegacyName(baseName: String, extension: String, downloadsDir: File): String {
    var index = 0
    while (true) {
      val name = if (index == 0) {
        "$baseName$extension"
      } else {
        "$baseName ($index)$extension"
      }
      if (!File(downloadsDir, name).exists()) {
        return name
      }
      index += 1
    }
  }

  private fun signWithApryse(
    inputPath: String,
    outputPath: String,
    privateKey: PrivateKey,
    certChain: Array<X509Certificate>,
  ) {
    val doc = PDFDoc(inputPath)
    doc.initSecurityHandler()

    val fieldName = "Signature1"
    val existingField = doc.getField(fieldName)
    val digsig: DigitalSignatureField = if (existingField != null && existingField.isValid) {
      DigitalSignatureField(existingField)
    } else {
      val newField = doc.createDigitalSignatureField(fieldName)
      val page = doc.getPage(1)
      val widget = SignatureWidget.create(doc, Rect(0.0, 0.0, 0.0, 0.0), newField)
      page.annotPushBack(widget)
      newField
    }

    // Use custom signing API for Android KeyChain certificates
    digsig.createSigDictForCustomSigning(
      "Adobe.PPKLite",
      DigitalSignatureField.SubFilterType.e_ETSI_CAdES_detached,
      8500  // Increased from 7500 to accommodate signature size (was 7833 bytes needed)
    )

    // Set signing time
    val currentDate = Date()
    currentDate.setCurrentTime()
    digsig.setSigDictTimeOfSigning(currentDate)

    // Save incrementally to prepare for signing
    doc.save(outputPath, SDFDoc.SaveMode.INCREMENTAL, null)

    // Calculate digest
    val pdfDigest = digsig.calculateDigest(DigestAlgorithm.e_sha256)

    // Convert Java X509Certificate to PDFTron X509Certificate
    val pdftronCerts = certChain.map { cert ->
      PDFTronX509Certificate(cert.encoded)
    }.toTypedArray()

    // Generate PAdES ESS attribute
    val padesAttr = DigitalSignatureField.generateESSSigningCertPAdESAttribute(
      pdftronCerts[0],
      DigestAlgorithm.e_sha256
    )

    // Generate signed attributes
    val signedAttrs = DigitalSignatureField.generateCMSSignedAttributes(pdfDigest, padesAttr)

    // Calculate digest of signed attributes (as per PDFTron documentation)
    val signedAttrsDigest = DigestAlgorithm.calculateDigest(
      DigestAlgorithm.e_sha256,
      signedAttrs
    )

    // Sign the digest with private key using NONEwithRSA (raw RSA encryption)
    // We use NONEwithRSA because the digest is already calculated
    // SHA256withRSA would hash it again, which is incorrect for CMS
    val signature = java.security.Signature.getInstance("NONEwithRSA")
    signature.initSign(privateKey)
    
    // For NONEwithRSA, we need to add PKCS#1 DigestInfo structure
    // DigestInfo ::= SEQUENCE {
    //   digestAlgorithm AlgorithmIdentifier,
    //   digest OCTET STRING
    // }
    val digestInfo = createDigestInfo(signedAttrsDigest)
    signature.update(digestInfo)
    val signatureValue = signature.sign()

    // Generate CMS signature
    val digestAlgId = AlgorithmIdentifier(
      ObjectIdentifier(ObjectIdentifier.Predefined.SHA256)
    )
    val sigAlgId = AlgorithmIdentifier(
      ObjectIdentifier(ObjectIdentifier.Predefined.RSA_encryption_PKCS1)
    )

    val cmsSignature = DigitalSignatureField.generateCMSSignature(
      pdftronCerts[0],
      pdftronCerts,
      digestAlgId,
      sigAlgId,
      signatureValue,
      signedAttrs
    )

    // Save the custom signature - this finalizes the document
    doc.saveCustomSignature(cmsSignature, digsig, outputPath)
    
    // Close the document to ensure all changes are flushed
    doc.close()
    
    // Verify the signature was applied correctly
    verifySignedDocument(outputPath)
  }

  private fun createDigestInfo(digest: ByteArray): ByteArray {
    // PKCS#1 DigestInfo structure for SHA-256
    // DigestInfo ::= SEQUENCE {
    //   digestAlgorithm AlgorithmIdentifier,
    //   digest OCTET STRING
    // }
    // SHA-256 OID: 2.16.840.1.101.3.4.2.1
    val sha256AlgorithmIdentifier = byteArrayOf(
      0x30, 0x0d, // SEQUENCE length 13
      0x06, 0x09, // OID length 9
      0x60, 0x86.toByte(), 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01, // SHA-256 OID
      0x05, 0x00  // NULL
    )
    
    val digestOctetString = byteArrayOf(
      0x04, digest.size.toByte() // OCTET STRING tag and length
    ) + digest
    
    val digestInfo = sha256AlgorithmIdentifier + digestOctetString
    
    // Wrap in SEQUENCE
    return byteArrayOf(
      0x30, digestInfo.size.toByte() // SEQUENCE tag and length
    ) + digestInfo
  }

  // ── Prescription reader methods ────────────────────────────────────────────

  /**
   * Returns the total page count of a PDF.
   * pageIndex in our block system maps directly to Apryse page (pageIndex + 1).
   */
  @ReactMethod
  fun getPdfPageCount(fileUri: String, password: String, promise: Promise) {
    Thread {
      try {
        ensurePdfNetInitialized()
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "PDF file not found: ${inputFile.absolutePath}")
          return@Thread
        }
        val doc = PDFDoc(inputFile.absolutePath)
        openDocWithPassword(doc, password)
        val count = doc.pageCount
        doc.close()
        promise.resolve(count)
      } catch (e: Exception) {
        promise.reject("E_PAGE_COUNT", e.message ?: "Failed to count pages", e)
      }
    }.start()
  }

  /**
   * Extracts text from a single PDF page (0-based pageIndex).
   * Parses "Nº de Receta:" to return the physical prescription number.
   *
   * Returns a map with:
   *   - pageIndex: Int (echo of input)
   *   - prescriptionNumber: String (e.g. "29-8448969", empty if not found)
   *   - rawText: String (full extracted text for debugging)
   */
  @ReactMethod
  fun extractPageText(fileUri: String, pageIndex: Int, password: String, promise: Promise) {
    Thread {
      try {
        ensurePdfNetInitialized()
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "PDF file not found: ${inputFile.absolutePath}")
          return@Thread
        }
        val doc = PDFDoc(inputFile.absolutePath)
        openDocWithPassword(doc, password)

        val aprysePageNum = pageIndex + 1   // Apryse pages are 1-based
        val page = doc.getPage(aprysePageNum)
        if (page == null || !page.isValid) {
          doc.close()
          promise.reject("E_INVALID_PAGE", "Page $aprysePageNum not found (total: ${doc.pageCount})")
          return@Thread
        }

        val extractor = TextExtractor()
        extractor.begin(page)
        val rawText = extractor.getAsText() ?: ""
        extractor.destroy()
        doc.close()

        val rxNumber = parseRxNumber(rawText)

        val result: WritableMap = Arguments.createMap()
        result.putInt("pageIndex", pageIndex)
        result.putString("prescriptionNumber", rxNumber)
        result.putString("rawText", rawText)
        promise.resolve(result)
      } catch (e: Exception) {
        promise.reject("E_EXTRACT_TEXT", e.message ?: "Text extraction failed", e)
      }
    }.start()
  }

  /**
   * Lists all AcroForm field names in the PDF (empty array if the document is flat/non-interactive).
   * Useful to determine whether the prescription PDF is a fillable form.
   */
  @ReactMethod
  fun listFormFields(fileUri: String, password: String, promise: Promise) {
    Thread {
      try {
        ensurePdfNetInitialized()
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "PDF file not found")
          return@Thread
        }
        val doc = PDFDoc(inputFile.absolutePath)
        openDocWithPassword(doc, password)

        val fieldNames = Arguments.createArray()
        val itr = doc.getFieldIterator()
        while (itr.hasNext()) {
          val field = itr.next()
          fieldNames.pushString(field?.name ?: "")
        }
        doc.close()
        promise.resolve(fieldNames)
      } catch (e: Exception) {
        promise.reject("E_LIST_FIELDS", e.message ?: "Failed to list fields", e)
      }
    }.start()
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Opens a PDFDoc with or without a password. */
  private fun openDocWithPassword(doc: PDFDoc, password: String) {
    if (password.isNotEmpty()) {
      val ok = doc.initStdSecurityHandler(password)
      if (!ok) throw IllegalArgumentException("Incorrect PDF password")
    } else {
      doc.initSecurityHandler()
    }
  }

  /**
   * Parses the physical prescription number (Nº de Receta) from extracted page text.
   * Handles variations like "Nº de Receta:", "Nº Receta:", "Num. Receta:", etc.
   */
  private fun parseRxNumber(text: String): String {
    val patterns = listOf(
      Regex("""N[ºo°]\s*\.?\s*de\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
      Regex("""N[ºo°]\s*\.?\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
      Regex("""Num(?:ero)?\s*\.?\s*(?:de\s*)?Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
    )
    for (pattern in patterns) {
      val match = pattern.find(text)
      if (match != null) {
        val value = match.groupValues[1].trim()
        if (value.isNotEmpty()) return value
      }
    }
    return ""
  }

  private fun verifySignedDocument(pdfPath: String) {
    try {
      val verifyDoc = PDFDoc(pdfPath)
      verifyDoc.initSecurityHandler()
      
      val fieldIterator = verifyDoc.getFieldIterator("Signature1")
      if (fieldIterator.hasNext()) {
        val field = fieldIterator.next()
        val digsigField = DigitalSignatureField(field)
        
        if (!digsigField.hasCryptographicSignature()) {
          throw Exception("Signature verification failed: No cryptographic signature found")
        }
        
        // Log signature info for debugging
        android.util.Log.d("PdfSigner", "Signature verified successfully")
        android.util.Log.d("PdfSigner", "Signer: ${digsigField.signatureName}")
        android.util.Log.d("PdfSigner", "Signing time: ${digsigField.signingTime}")
      } else {
        throw Exception("Signature verification failed: Signature field not found")
      }
      
      verifyDoc.close()
    } catch (e: Exception) {
      android.util.Log.e("PdfSigner", "Signature verification error: ${e.message}", e)
      throw Exception("Signature verification failed: ${e.message}")
    }
  }
}
