# Acciones en Cards de Prescripciones

## Resumen
Se han agregado botones de acción (Firmar y Compartir) a las cards de prescripciones con lógica condicional basada en el estado.

## Cambios Realizados

### 1. PrescriptionCard - Botones de Acción
**Archivo**: `apps/mobile/src/components/PrescriptionCard.tsx`

**Nuevas Props**:
```typescript
interface Props {
  prescription: Prescription;
  onSign?: (prescription: Prescription) => void;
  onShare?: (prescription: Prescription) => void;
}
```

**Botones Agregados**:

1. **Botón Firmar**:
   - Solo visible cuando `status === 'pending'`
   - Icono: `create-outline` (lápiz)
   - Color: Morado (#5551F5)
   - Callback: `onSign(prescription)`

2. **Botón Compartir**:
   - Siempre visible
   - Solo habilitado cuando `status === 'signed'`
   - Icono: `share-social-outline`
   - Color: Verde (#10B981) cuando habilitado, gris cuando deshabilitado
   - Callback: `onShare(prescription)` solo si está firmada

**Estilos**:
- Sección de acciones con borde superior
- Botones con flex: 1 para ocupar espacio igual
- Estados visuales claros (habilitado/deshabilitado)
- Bordes y fondos de colores según el tipo de acción

### 2. HomeScreen - Handlers de Acciones
**Archivo**: `apps/mobile/src/screens/HomeScreen.tsx`

**Nuevos Handlers**:

1. **handleSign**:
   - Muestra confirmación antes de firmar
   - Actualiza el estado a 'signed' usando `PrescriptionService.updateStatus()`
   - Recarga los datos después de firmar
   - Muestra mensaje de éxito

2. **handleShare**:
   - Muestra confirmación antes de compartir
   - TODO: Implementar generación de PDF y compartir
   - Por ahora muestra mensaje "En desarrollo"

**Integración**:
```typescript
<PrescriptionCard
  key={p.id}
  prescription={p}
  onSign={handleSign}
  onShare={handleShare}
/>
```

## Lógica de Visibilidad

### Botón Firmar
```
Estado: pending → Botón VISIBLE
Estado: signed  → Botón OCULTO
Estado: expired → Botón OCULTO
```

### Botón Compartir
```
Estado: pending → Botón VISIBLE pero DESHABILITADO (gris)
Estado: signed  → Botón VISIBLE y HABILITADO (verde)
Estado: expired → Botón VISIBLE pero DESHABILITADO (gris)
```

## Flujo de Usuario

### Firmar Prescripción
1. Usuario ve prescripción con estado "pending"
2. Presiona botón "Firmar" (morado)
3. Aparece confirmación
4. Confirma la acción
5. Estado cambia a "signed"
6. Botón "Firmar" desaparece
7. Botón "Compartir" se habilita (verde)
8. Mensaje de éxito

### Compartir Prescripción
1. Usuario ve prescripción con estado "signed"
2. Botón "Compartir" está habilitado (verde)
3. Presiona botón "Compartir"
4. Aparece confirmación
5. Confirma la acción
6. TODO: Se genera PDF y se comparte

## Estilos Visuales

### Botón Firmar (Activo)
- Borde: #5551F5 (morado)
- Fondo: #EEF2FF (morado claro)
- Texto: #5551F5 (morado)
- Icono: create-outline

### Botón Compartir (Habilitado)
- Borde: #10B981 (verde)
- Fondo: #ECFDF5 (verde claro)
- Texto: #10B981 (verde)
- Icono: share-social-outline

### Botón Compartir (Deshabilitado)
- Borde: #E5E7EB (gris)
- Fondo: #F9FAFB (gris claro)
- Texto: #9CA3AF (gris)
- Icono: share-social-outline (gris)

## Próximos Pasos

### Implementar Compartir
1. Generar PDF de la prescripción con:
   - Datos del paciente
   - Medicamento y dosis
   - Instrucciones
   - Número de receta
   - Firma digital (si aplica)
2. Usar `react-native-share` para compartir el PDF
3. Opciones de compartir:
   - WhatsApp
   - Email
   - Guardar en dispositivo
   - Imprimir

### Mejoras Futuras
- Agregar botón de eliminar (solo para pending)
- Agregar botón de editar (solo para pending)
- Agregar vista detallada al tocar la card
- Agregar historial de cambios de estado
- Agregar opción de revocar firma

## Testing

Para probar:
1. Crear una prescripción nueva (estado: pending)
2. Verificar que aparece botón "Firmar" (morado)
3. Verificar que botón "Compartir" está deshabilitado (gris)
4. Presionar "Firmar" y confirmar
5. Verificar que botón "Firmar" desaparece
6. Verificar que botón "Compartir" se habilita (verde)
7. Presionar "Compartir" (por ahora muestra mensaje "En desarrollo")

## Archivos Modificados

- `apps/mobile/src/components/PrescriptionCard.tsx`
- `apps/mobile/src/screens/HomeScreen.tsx`
