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
import android.util.Log
import androidx.core.content.FileProvider
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

  /**
   * Check if the device has digital certificates installed.
   * Returns true if certificates are available, false otherwise.
   */
  @ReactMethod
  fun hasCertificatesInstalled(promise: Promise) {
    try {
      // We can't directly check if certificates exist without user interaction,
      // but we can provide a method that the app can use to inform the user
      // For now, we'll return true and let the signing process handle the case
      // where no certificates are available (user cancels or no certs found)
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("E_CHECK_CERTS", e.message, e)
    }
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

  /**
   * Signs a PDF digitally and adds signature text (doctor name, date, time).
   * This method adds visible text before applying the digital signature.
   */
  @ReactMethod
  fun signPdfWithText(
    inputPdfPath: String,
    doctorName: String,
    signDate: String,
    signTime: String,
    promise: Promise
  ) {
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

              // Step 1: Add signature text to PDF
              val tempWithText = File(reactApplicationContext.filesDir, "with_text_${System.currentTimeMillis()}.pdf")
              addSignatureTextToPdf(inputFile.absolutePath, tempWithText.absolutePath, doctorName, signDate, signTime)

              // Step 2: Sign the PDF with text
              val tempOutputFile = File(reactApplicationContext.filesDir, "signed_${System.currentTimeMillis()}.pdf")
              signWithApryse(tempWithText.absolutePath, tempOutputFile.absolutePath, privateKey, certChain)
              
              // Clean up temp file
              tempWithText.delete()
              
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

  /**
   * Adds signature text to the bottom right of the first page of a PDF.
   * Text format:
   * "Firmado digitalmente por [doctorName]"
   * "Fecha: [signDate]"
   * "Hora: [signTime]"
   */
  private fun addSignatureTextToPdf(
    inputPath: String,
    outputPath: String,
    doctorName: String,
    signDate: String,
    signTime: String
  ) {
    val doc = PDFDoc(inputPath)
    doc.initSecurityHandler()

    val page = doc.getPage(1)
    if (page == null || !page.isValid) {
      doc.close()
      throw IllegalStateException("Invalid first page")
    }

    val writer = com.pdftron.pdf.ElementWriter()
    val builder = com.pdftron.pdf.ElementBuilder()
    
    writer.begin(page, com.pdftron.pdf.ElementWriter.e_overlay, false, true)

    // Get page dimensions
    val pageRect = page.cropBox
    val pageWidth = pageRect.width
    val pageHeight = pageRect.height

    // Font configuration
    val fontSize = 8.0
    val font = com.pdftron.pdf.Font.create(doc, com.pdftron.pdf.Font.e_helvetica)

    // Position: bottom right corner with some margin
    val marginRight = 50.0
    val marginBottom = 30.0
    val lineHeight = 10.0

    // Calculate X position (right-aligned)
    val textX = pageWidth - marginRight - 150.0  // 150 is approximate text width
    
    // Calculate Y positions (from bottom)
    val line1Y = marginBottom + lineHeight * 2  // "Hora: XX:XX"
    val line2Y = marginBottom + lineHeight      // "Fecha: DD/MM/YYYY"
    val line3Y = marginBottom                    // "Firmado digitalmente por..."

    // Helper function to add text
    fun addTextAt(text: String, x: Double, y: Double) {
      val element = builder.createTextBegin(font, fontSize)
      writer.writeElement(element)

      val textElement = builder.createTextRun(text)
      textElement.setTextMatrix(1.0, 0.0, 0.0, 1.0, x, y)
      writer.writeElement(textElement)

      val endElement = builder.createTextEnd()
      writer.writeElement(endElement)
    }

    // Add the three lines of text
    addTextAt("Firmado digitalmente por $doctorName", textX, line3Y)
    addTextAt("Fecha: $signDate", textX, line2Y)
    addTextAt("Hora: $signTime", textX, line1Y)

    writer.end()
    doc.save(outputPath, SDFDoc.SaveMode.LINEARIZED, null)
    doc.close()
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
   * Simplified method to extract ONLY the prescription number from first page.
   * More robust and less prone to crashes.
   */
  @ReactMethod
  fun extractPrescriptionNumber(fileUri: String, password: String, promise: Promise) {
    Thread {
      var doc: PDFDoc? = null
      var extractor: TextExtractor? = null
      try {
        Log.d("PdfSignerModule", "Starting prescription number extraction...")
        ensurePdfNetInitialized()
        
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          Log.e("PdfSignerModule", "File not found: ${inputFile.absolutePath}")
          promise.reject("E_NOT_FOUND", "PDF file not found")
          return@Thread
        }
        
        Log.d("PdfSignerModule", "Opening PDF document...")
        doc = PDFDoc(inputFile.absolutePath)
        
        if (password.isNotEmpty()) {
          Log.d("PdfSignerModule", "Applying password...")
          val ok = doc.initStdSecurityHandler(password)
          if (!ok) {
            Log.e("PdfSignerModule", "Incorrect password")
            doc.close()
            promise.reject("E_PASSWORD", "Incorrect PDF password")
            return@Thread
          }
        } else {
          doc.initSecurityHandler()
        }

        val totalPages = doc.pageCount
        Log.d("PdfSignerModule", "Total pages: $totalPages")
        
        if (totalPages < 1) {
          doc.close()
          promise.reject("E_NO_PAGES", "PDF has no pages")
          return@Thread
        }
        
        Log.d("PdfSignerModule", "Getting first page...")
        val page = doc.getPage(1) // First page (1-based)
        if (page == null || !page.isValid) {
          doc.close()
          promise.reject("E_INVALID_PAGE", "First page is invalid")
          return@Thread
        }

        Log.d("PdfSignerModule", "Extracting text from first page...")
        extractor = TextExtractor()
        extractor.begin(page)
        val rawText = extractor.getAsText() ?: ""
        
        Log.d("PdfSignerModule", "Text extracted (${rawText.length} chars)")
        
        // Parse prescription number
        val rxNumber = try {
          parseRxNumber(rawText)
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error parsing Rx number: ${e.message}", e)
          ""
        }

        Log.d("PdfSignerModule", "Prescription number: '$rxNumber'")

        val result: WritableMap = Arguments.createMap()
        result.putString("prescriptionNumber", rxNumber)
        result.putBoolean("success", rxNumber.isNotEmpty())
        
        promise.resolve(result)
      } catch (e: Exception) {
        Log.e("PdfSignerModule", "Fatal error extracting prescription number: ${e.message}", e)
        e.printStackTrace()
        promise.reject("E_EXTRACT_FAILED", "Failed to extract prescription number: ${e.message}", e)
      } finally {
        try {
          extractor?.destroy()
          Log.d("PdfSignerModule", "Extractor destroyed")
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error destroying extractor: ${e.message}")
        }
        try {
          doc?.close()
          Log.d("PdfSignerModule", "Document closed")
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error closing document: ${e.message}")
        }
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
      var doc: PDFDoc? = null
      var extractor: TextExtractor? = null
      try {
        ensurePdfNetInitialized()
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "PDF file not found: ${inputFile.absolutePath}")
          return@Thread
        }
        
        doc = PDFDoc(inputFile.absolutePath)
        openDocWithPassword(doc, password)

        val aprysePageNum = pageIndex + 1   // Apryse pages are 1-based
        val totalPages = doc.pageCount
        
        if (aprysePageNum > totalPages || aprysePageNum < 1) {
          doc.close()
          promise.reject("E_INVALID_PAGE", "Page $aprysePageNum not found (total: $totalPages)")
          return@Thread
        }
        
        val page = doc.getPage(aprysePageNum)
        if (page == null || !page.isValid) {
          doc.close()
          promise.reject("E_INVALID_PAGE", "Page $aprysePageNum is invalid")
          return@Thread
        }

        extractor = TextExtractor()
        extractor.begin(page)
        val rawText = extractor.getAsText() ?: ""
        
        Log.d("PdfSignerModule", "Extracted text from page $pageIndex (length: ${rawText.length})")
        
        val rxNumber = try {
          parseRxNumber(rawText)
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error parsing Rx number: ${e.message}", e)
          ""
        }

        val result: WritableMap = Arguments.createMap()
        result.putInt("pageIndex", pageIndex)
        result.putString("prescriptionNumber", rxNumber)
        result.putString("rawText", rawText)
        
        promise.resolve(result)
      } catch (e: Exception) {
        Log.e("PdfSignerModule", "Error extracting text from page $pageIndex: ${e.message}", e)
        promise.reject("E_EXTRACT_TEXT", e.message ?: "Text extraction failed", e)
      } finally {
        try {
          extractor?.destroy()
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error destroying extractor: ${e.message}")
        }
        try {
          doc?.close()
        } catch (e: Exception) {
          Log.e("PdfSignerModule", "Error closing document: ${e.message}")
        }
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
    try {
      val patterns = listOf(
        Regex("""N[ºo°]\s*\.?\s*de\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
        Regex("""N[ºo°]\s*\.?\s*Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
        Regex("""Num(?:ero)?\s*\.?\s*(?:de\s*)?Receta\s*:?\s*([A-Za-z0-9\-/]+)""", RegexOption.IGNORE_CASE),
      )
      for (pattern in patterns) {
        val match = pattern.find(text)
        if (match != null && match.groupValues.size > 1) {
          val value = match.groupValues[1].trim()
          if (value.isNotEmpty()) {
            Log.d("PdfSignerModule", "Found Rx number: $value")
            return value
          }
        }
      }
      Log.d("PdfSignerModule", "No Rx number found in text (length: ${text.length})")
    } catch (e: Exception) {
      Log.e("PdfSignerModule", "Error parsing Rx number: ${e.message}", e)
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

  /**
   * Decrypt a password-protected PDF and save it to cache without password.
   * Returns the path to the decrypted PDF.
   * This is useful for OCR processing which doesn't support encrypted PDFs.
   */
  @ReactMethod
  fun decryptPdfToCache(fileUri: String, password: String, promise: Promise) {
    Thread {
      var doc: PDFDoc? = null
      try {
        ensurePdfNetInitialized()
        val inputFile = resolveInputToFile(fileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "PDF file not found: ${inputFile.absolutePath}")
          return@Thread
        }

        // Open the encrypted PDF
        doc = PDFDoc(inputFile.absolutePath)
        if (password.isNotEmpty()) {
          val ok = doc.initStdSecurityHandler(password)
          if (!ok) {
            promise.reject("E_WRONG_PASSWORD", "Incorrect password")
            return@Thread
          }
        }

        // Create output file in cache directory
        val cacheDir = reactApplicationContext.cacheDir
        val outputFile = File(cacheDir, "decrypted_${System.currentTimeMillis()}.pdf")

        // Remove security (decrypt)
        doc.removeSecurity()

        // Save the decrypted PDF
        doc.save(outputFile.absolutePath, SDFDoc.SaveMode.LINEARIZED, null)
        doc.close()

        // Return the file URI
        promise.resolve("file://${outputFile.absolutePath}")
      } catch (e: Exception) {
        doc?.close()
        promise.reject("E_DECRYPT", e.message ?: "Failed to decrypt PDF", e)
      }
    }.start()
  }

  /**
   * Creates a prescription PDF from a specific page of the prescription block.
   * Extracts the page, adds patient data at configured positions.
   * Each page has 2 prescriptions (top and bottom).
   * Returns the path to the created PDF (ready to be signed).
   * 
   * @param blockFileUri: URI of the prescription block PDF
   * @param pageIndex: 0-based page index to extract
   * @param password: PDF password (if encrypted)
   * @param prescriptionIndex: Index of prescription in block (0-based) - used to determine top/bottom position
   * @param patientName: Patient's full name
   * @param patientDocument: Patient's document (DNI, etc.)
   * @param patientBirthDate: Patient's birth date (DD/MM/AAAA)
   * @param medication: Medication name
   * @param dosage: Treatment duration (e.g., 7 days, 2 weeks)
   * @param instructions: Additional instructions/posology
   * @param signatureImagePath: Optional path to signature image file
   */
  @ReactMethod
  fun createPrescriptionPdf(
    blockFileUri: String,
    pageIndex: Int,
    password: String,
    prescriptionIndex: Int,
    patientName: String,
    patientDocument: String,
    patientBirthDate: String,
    medication: String,
    dosage: String,
    instructions: String,
    signatureImagePath: String?,
    promise: Promise
  ) {
    Thread {
      var sourceDoc: PDFDoc? = null
      var newDoc: PDFDoc? = null
      try {
        ensurePdfNetInitialized()
        
        // Open source PDF (prescription block)
        val inputFile = resolveInputToFile(blockFileUri)
        if (!inputFile.exists()) {
          promise.reject("E_NOT_FOUND", "Prescription block PDF not found")
          return@Thread
        }

        sourceDoc = PDFDoc(inputFile.absolutePath)
        openDocWithPassword(sourceDoc, password)

        val aprysePageNum = pageIndex + 1
        val totalPages = sourceDoc.pageCount
        
        if (aprysePageNum > totalPages || aprysePageNum < 1) {
          sourceDoc.close()
          promise.reject("E_INVALID_PAGE", "Page $aprysePageNum not found (total: $totalPages)")
          return@Thread
        }

        // Create new document
        newDoc = PDFDoc()
        
        // Import the specific page from source
        // Use the simpler API: insertPages(index, sourceDoc, startPage, endPage, flag)
        newDoc.insertPages(0, sourceDoc, aprysePageNum, aprysePageNum, 0, null)

        // Get the imported page
        val page = newDoc.getPage(1)
        if (page == null || !page.isValid) {
          newDoc.close()
          sourceDoc.close()
          promise.reject("E_INVALID_PAGE", "Failed to import page")
          return@Thread
        }

        // Add text overlay with prescription data
        // Determine if this is top or bottom prescription (even index = top, odd = bottom)
        val isTopPrescription = prescriptionIndex % 2 == 0
        addPrescriptionDataToPage(newDoc, page, isTopPrescription, patientName, patientDocument, patientBirthDate, medication, dosage, instructions, signatureImagePath)

        // Save to cache
        val cacheDir = reactApplicationContext.cacheDir
        val outputFile = File(cacheDir, "prescription_${System.currentTimeMillis()}.pdf")
        
        try {
          newDoc.save(outputFile.absolutePath, SDFDoc.SaveMode.LINEARIZED, null)
        } catch (saveException: Exception) {
          // Check if it's just a license warning
          if (saveException.message?.contains("Bad License Key") == true) {
            Log.w("PdfSignerModule", "PDFNet is running in demo mode - this is expected for trial versions")
            // The file was still saved, continue
          } else {
            throw saveException
          }
        }
        
        newDoc.close()
        sourceDoc.close()

        // Get a shareable content URI for the file
        val shareableUri = getShareableUri(outputFile)
        
        Log.d("PdfSignerModule", "Prescription PDF created successfully: ${shareableUri}")
        
        // Return the content URI (not file URI)
        promise.resolve(shareableUri.toString())
      } catch (e: Exception) {
        newDoc?.close()
        sourceDoc?.close()
        Log.e("PdfSignerModule", "Error creating prescription PDF: ${e.message}", e)
        promise.reject("E_CREATE_PRESCRIPTION", e.message ?: "Failed to create prescription PDF", e)
      }
    }.start()
  }

  /**
   * Gets a shareable content:// URI for a file using FileProvider.
   * This is required for Android 7+ to share files with other apps.
   */
  private fun getShareableUri(file: File): Uri {
    return try {
      FileProvider.getUriForFile(
        reactApplicationContext,
        "${reactApplicationContext.packageName}.fileprovider",
        file
      )
    } catch (e: Exception) {
      Log.e("PdfSignerModule", "Error getting shareable URI: ${e.message}", e)
      // Fallback to file URI (won't work on Android 7+ but better than crashing)
      Uri.fromFile(file)
    }
  }

  /**
   * Adds prescription data to the page using specific X,Y coordinates.
   * First tries to fill form fields if they exist, otherwise overlays text at configured positions.
   * 
   * @param isTopPrescription: true for top prescription, false for bottom prescription
   * @param signatureImagePath: Optional path to signature image file
   */
  private fun addPrescriptionDataToPage(
    doc: PDFDoc,
    page: com.pdftron.pdf.Page,
    isTopPrescription: Boolean,
    patientName: String,
    patientDocument: String,
    patientBirthDate: String,
    medication: String,
    dosage: String,
    instructions: String,
    signatureImagePath: String?
  ) {
    // Try to fill form fields first
    val fieldsFilled = tryFillFormFields(doc, patientName, patientDocument, patientBirthDate, medication, dosage, instructions)
    
    if (fieldsFilled) {
      Log.d("PdfSignerModule", "Prescription data filled in form fields")
      // Still add signature image if available
      if (!signatureImagePath.isNullOrEmpty()) {
        addSignatureImage(doc, page, isTopPrescription, signatureImagePath)
      }
      return
    }
    
    // If no form fields, overlay text at configured positions
    Log.d("PdfSignerModule", "No form fields found, using text overlay for ${if (isTopPrescription) "TOP" else "BOTTOM"} prescription")
    overlayPrescriptionText(doc, page, isTopPrescription, patientName, patientDocument, patientBirthDate, medication, dosage, instructions)
    
    // Add signature image if available
    if (!signatureImagePath.isNullOrEmpty()) {
      addSignatureImage(doc, page, isTopPrescription, signatureImagePath)
    }
  }

  /**
   * Attempts to fill form fields with prescription data.
   * Returns true if fields were found and filled, false otherwise.
   */
  private fun tryFillFormFields(
    doc: PDFDoc,
    patientName: String,
    patientDocument: String,
    patientBirthDate: String,
    medication: String,
    dosage: String,
    instructions: String
  ): Boolean {
    try {
      var fieldsFound = false
      
      // Common field name patterns for prescription forms
      val fieldMappings = mapOf(
        // Patient fields
        listOf("paciente", "patient", "nombre", "name", "apellidos") to patientName,
        listOf("dni", "documento", "document", "id", "nif", "nie") to patientDocument,
        listOf("fecha_nacimiento", "birth_date", "birthdate", "nacimiento", "fecha_nac", "dob") to patientBirthDate,
        
        // Medication fields
        listOf("medicamento", "medication", "medicine", "farmaco", "principio_activo") to medication,
        listOf("duracion", "duration", "dosis", "dosage", "dose", "cantidad") to dosage,
        listOf("posologia", "instrucciones", "instructions", "indicaciones") to instructions
      )
      
      // Iterate through all fields in the document
      val fieldIterator = doc.fieldIterator
      while (fieldIterator.hasNext()) {
        val field = fieldIterator.next()
        if (field == null || !field.isValid) continue
        
        val fieldName = field.name?.lowercase() ?: continue
        Log.d("PdfSignerModule", "Found field: $fieldName")
        
        // Try to match field name with our data
        for ((patterns, value) in fieldMappings) {
          if (value.isEmpty()) continue
          
          if (patterns.any { pattern -> fieldName.contains(pattern) }) {
            try {
              field.setValue(value)
              field.refreshAppearance()
              fieldsFound = true
              Log.d("PdfSignerModule", "Filled field '$fieldName' with value")
            } catch (e: Exception) {
              Log.w("PdfSignerModule", "Could not fill field '$fieldName': ${e.message}")
            }
            break
          }
        }
      }
      
      return fieldsFound
    } catch (e: Exception) {
      Log.e("PdfSignerModule", "Error filling form fields: ${e.message}", e)
      return false
    }
  }

  /**
   * Overlays prescription text on the page at specific X,Y coordinates.
   * Uses hardcoded positions that match the prescription template.
   * 
   * TODO: Make these coordinates configurable from React Native side
   */
  private fun overlayPrescriptionText(
    doc: PDFDoc,
    page: com.pdftron.pdf.Page,
    isTopPrescription: Boolean,
    patientName: String,
    patientDocument: String,
    patientBirthDate: String,
    medication: String,
    dosage: String,
    instructions: String
  ) {
    val writer = com.pdftron.pdf.ElementWriter()
    val builder = com.pdftron.pdf.ElementBuilder()
    
    writer.begin(page, com.pdftron.pdf.ElementWriter.e_overlay, false, true)

    // Get page dimensions for reference
    val pageRect = page.cropBox
    val pageWidth = pageRect.width
    val pageHeight = pageRect.height
    
    Log.d("PdfSignerModule", "Page dimensions: ${pageWidth}x${pageHeight}")
    Log.d("PdfSignerModule", "Filling ${if (isTopPrescription) "TOP" else "BOTTOM"} prescription")

    // Font configuration
    val fontSize = 9.0
    val font = com.pdftron.pdf.Font.create(doc, com.pdftron.pdf.Font.e_helvetica)

    // Helper function to add text at specific position
    fun addTextAt(text: String, x: Double, y: Double) {
      val element = builder.createTextBegin(font, fontSize)
      writer.writeElement(element)

      val textElement = builder.createTextRun(text)
      textElement.setTextMatrix(1.0, 0.0, 0.0, 1.0, x, y)
      writer.writeElement(textElement)

      val endElement = builder.createTextEnd()
      writer.writeElement(endElement)
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COORDENADAS ESPECÍFICAS - Ajusta estos valores según tu plantilla
    // ═══════════════════════════════════════════════════════════════════════
    
    // Coordenadas para RECETA SUPERIOR (mitad superior de la página)
    val topPatientNameX = 150.0
    val topPatientNameY = 700.0
    val topPatientBirthDateX = 150.0
    val topPatientBirthDateY = 680.0
    val topPatientDocX = 150.0
    val topPatientDocY = 660.0
    val topMedicationX = 150.0
    val topMedicationY = 620.0
    val topDosageX = 150.0
    val topDosageY = 600.0
    val topInstructionsX = 150.0
    val topInstructionsY = 560.0
    
    // Coordenadas para RECETA INFERIOR (mitad inferior de la página)
    val bottomPatientNameX = 150.0
    val bottomPatientNameY = 350.0
    val bottomPatientBirthDateX = 150.0
    val bottomPatientBirthDateY = 330.0
    val bottomPatientDocX = 150.0
    val bottomPatientDocY = 310.0
    val bottomMedicationX = 150.0
    val bottomMedicationY = 270.0
    val bottomDosageX = 150.0
    val bottomDosageY = 250.0
    val bottomInstructionsX = 150.0
    val bottomInstructionsY = 210.0
    
    // Seleccionar coordenadas según posición
    val patNameX: Double
    val patNameY: Double
    val patBirthDateX: Double
    val patBirthDateY: Double
    val patDocX: Double
    val patDocY: Double
    val medX: Double
    val medY: Double
    val dosX: Double
    val dosY: Double
    val instX: Double
    val instY: Double
    
    if (isTopPrescription) {
      patNameX = topPatientNameX
      patNameY = topPatientNameY
      patBirthDateX = topPatientBirthDateX
      patBirthDateY = topPatientBirthDateY
      patDocX = topPatientDocX
      patDocY = topPatientDocY
      medX = topMedicationX
      medY = topMedicationY
      dosX = topDosageX
      dosY = topDosageY
      instX = topInstructionsX
      instY = topInstructionsY
    } else {
      patNameX = bottomPatientNameX
      patNameY = bottomPatientNameY
      patBirthDateX = bottomPatientBirthDateX
      patBirthDateY = bottomPatientBirthDateY
      patDocX = bottomPatientDocX
      patDocY = bottomPatientDocY
      medX = bottomMedicationX
      medY = bottomMedicationY
      dosX = bottomDosageX
      dosY = bottomDosageY
      instX = bottomInstructionsX
      instY = bottomInstructionsY
    }
    
    // Añadir datos en las posiciones configuradas
    addTextAt(patientName, patNameX, patNameY)
    Log.d("PdfSignerModule", "Patient name at ($patNameX, $patNameY)")
    
    if (patientBirthDate.isNotEmpty()) {
      addTextAt(patientBirthDate, patBirthDateX, patBirthDateY)
      Log.d("PdfSignerModule", "Patient birth date at ($patBirthDateX, $patBirthDateY)")
    }
    
    if (patientDocument.isNotEmpty()) {
      addTextAt(patientDocument, patDocX, patDocY)
      Log.d("PdfSignerModule", "Patient document at ($patDocX, $patDocY)")
    }
    
    addTextAt(medication, medX, medY)
    Log.d("PdfSignerModule", "Medication at ($medX, $medY)")
    
    addTextAt(dosage, dosX, dosY)
    Log.d("PdfSignerModule", "Duration at ($dosX, $dosY)")
    
    if (instructions.isNotEmpty()) {
      // Split long text into multiple lines
      val maxCharsPerLine = 50
      val lineSpacing = 15.0
      val instructionLines = instructions.chunked(maxCharsPerLine)
      var currentY = instY
      
      instructionLines.take(3).forEach { line ->  // Max 3 lines
        addTextAt(line, instX, currentY)
        currentY -= lineSpacing
      }
      Log.d("PdfSignerModule", "Instructions at ($instX, $instY)")
    }

    writer.end()
    
    Log.d("PdfSignerModule", "Text overlay completed for ${if (isTopPrescription) "TOP" else "BOTTOM"} prescription")
  }

  /**
   * Adds signature image to the prescription PDF
   */
  private fun addSignatureImage(
    doc: PDFDoc,
    page: com.pdftron.pdf.Page,
    isTopPrescription: Boolean,
    signatureImagePath: String
  ) {
    try {
      Log.d("PdfSignerModule", "Adding signature image: $signatureImagePath")
      
      // Get page dimensions
      val pageRect = page.cropBox
      val pageWidth = pageRect.width
      val pageHeight = pageRect.height
      
      // Signature position and size
      // Position in bottom right of each prescription area
      val signatureWidth = 120.0
      val signatureHeight = 40.0
      val marginRight = 50.0
      
      val signatureX: Double
      val signatureY: Double
      
      if (isTopPrescription) {
        // Top prescription - bottom right of top half
        signatureX = pageWidth - signatureWidth - marginRight
        signatureY = pageHeight / 2 + 50.0  // Just above the middle line
      } else {
        // Bottom prescription - bottom right of bottom half
        signatureX = pageWidth - signatureWidth - marginRight
        signatureY = 50.0  // Near bottom of page
      }
      
      // Create image from file
      val img = com.pdftron.pdf.Image.create(doc, signatureImagePath)
      
      // Create element builder and writer
      val builder = com.pdftron.pdf.ElementBuilder()
      val writer = com.pdftron.pdf.ElementWriter()
      
      writer.begin(page, com.pdftron.pdf.ElementWriter.e_overlay, false, true)
      
      // Create image element
      val element = builder.createImage(img, signatureX, signatureY, signatureWidth, signatureHeight)
      writer.writePlacedElement(element)
      
      writer.end()
      
      Log.d("PdfSignerModule", "Signature image added at ($signatureX, $signatureY) size: ${signatureWidth}x${signatureHeight}")
    } catch (e: Exception) {
      Log.e("PdfSignerModule", "Error adding signature image: ${e.message}", e)
      // Don't throw - signature is optional, continue without it
    }
  }
}
