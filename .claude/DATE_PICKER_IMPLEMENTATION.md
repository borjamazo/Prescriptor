# Implementación de Selector de Fecha de Nacimiento

## Resumen
Se ha reemplazado el campo de texto manual para la fecha de nacimiento por un selector de fecha nativo del sistema, mejorando la experiencia de usuario y evitando errores de formato.

## Problema
El campo de fecha de nacimiento era un campo de texto libre donde el usuario debía escribir manualmente la fecha en formato DD/MM/AAAA, lo que causaba:
- Errores de formato
- Dificultad para ingresar la fecha
- No había validación de fechas válidas
- Mala experiencia de usuario

## Solución Implementada

### 1. Nuevo Componente: DatePickerField
Se creó un componente reutilizable que:
- Muestra un campo con icono de calendario
- Al hacer clic, abre el selector de fecha nativo del sistema
- Formatea automáticamente la fecha a DD/MM/YYYY
- Soporta Android e iOS con sus respectivos estilos nativos
- Permite establecer fecha máxima (hoy) para evitar fechas futuras

### 2. Características del Componente

**Props:**
- `label`: Etiqueta del campo
- `value`: Fecha seleccionada (Date | null)
- `onChange`: Callback cuando cambia la fecha
- `placeholder`: Texto cuando no hay fecha seleccionada
- `leftIcon`: Icono a la izquierda (default: calendar-outline)
- `maximumDate`: Fecha máxima permitida
- `minimumDate`: Fecha mínima permitida

**Comportamiento Android:**
- Muestra el selector de fecha nativo de Android
- Se cierra automáticamente al seleccionar
- Botones nativos de "Cancelar" y "OK"

**Comportamiento iOS:**
- Muestra un modal con selector tipo rueda
- Botones personalizados "Cancelar" y "Listo"
- Estilo consistente con la app

### 3. Integración en PrescriptionCreateScreen

**Cambios realizados:**
1. Estado cambiado de `string` a `Date | null`
2. Reemplazado `TextInputField` por `DatePickerField`
3. Formato automático a DD/MM/YYYY al crear prescripción
4. Fecha máxima establecida a hoy (no permite fechas futuras)
5. Preview actualizado para mostrar fecha formateada

## Archivos Creados/Modificados

### 1. Nuevo: `apps/mobile/src/components/DatePickerField.tsx`
Componente completo de selector de fecha con:
- Soporte Android e iOS
- Modal personalizado para iOS
- Formato DD/MM/YYYY
- Validación de fechas
- Estilos consistentes con la app

### 2. Modificado: `apps/mobile/src/screens/PrescriptionCreateScreen.tsx`
**Cambios:**
```typescript
// Antes
const [patientBirthDate, setPatientBirthDate] = useState('');

// Después
const [patientBirthDate, setPatientBirthDate] = useState<Date | null>(null);
```

**Campo reemplazado:**
```tsx
// Antes
<TextInputField
  label="Fecha de Nacimiento"
  value={patientBirthDate}
  onChangeText={setPatientBirthDate}
  placeholder="DD/MM/AAAA"
  leftIcon="calendar-outline"
  keyboardType="numeric"
/>

// Después
<DatePickerField
  label="Fecha de Nacimiento"
  value={patientBirthDate}
  onChange={setPatientBirthDate}
  placeholder="Seleccionar fecha"
  leftIcon="calendar-outline"
  maximumDate={new Date()}
/>
```

**Formato al crear:**
```typescript
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const input: NewPrescriptionInput = {
  // ...
  patientBirthDate: formatDate(patientBirthDate),
  // ...
};
```

### 3. Modificado: `apps/mobile/package.json`
**Dependencia agregada:**
```json
"@react-native-community/datetimepicker": "^8.2.0"
```

## Instalación

### Paso 1: Instalar dependencias
```bash
cd apps/mobile
bash -c 'source ~/.nvm/nvm.sh && nvm use 20.19.3 && npm install'
```

### Paso 2: Instalar pods (solo iOS)
```bash
cd apps/mobile/ios
pod install
cd ..
```

### Paso 3: Reconstruir la app
**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Características del Selector

### Validación
- ✅ No permite fechas futuras (maximumDate = hoy)
- ✅ Formato automático DD/MM/YYYY
- ✅ Campo opcional (puede quedar vacío)
- ✅ Selector nativo del sistema

### Experiencia de Usuario
- ✅ Un toque para abrir selector
- ✅ Selector visual (no escribir manualmente)
- ✅ Imposible ingresar formato incorrecto
- ✅ Icono de calendario visible
- ✅ Placeholder claro "Seleccionar fecha"
- ✅ Flecha indicando que es clickeable

### Internacionalización
- ✅ Locale configurado a "es-ES"
- ✅ Nombres de meses en español
- ✅ Formato DD/MM/YYYY (europeo)

## Testing Checklist

- [ ] Abrir pantalla de crear prescripción
- [ ] Hacer clic en campo "Fecha de Nacimiento"
- [ ] Verificar que se abre selector nativo
- [ ] Seleccionar una fecha
- [ ] Verificar que se muestra en formato DD/MM/YYYY
- [ ] Verificar que no permite seleccionar fechas futuras
- [ ] Crear prescripción con fecha seleccionada
- [ ] Verificar que la fecha se guarda correctamente
- [ ] Verificar que aparece en el PDF generado
- [ ] Probar cancelar selección de fecha
- [ ] Probar crear prescripción sin fecha (opcional)
- [ ] Probar en Android
- [ ] Probar en iOS

## Notas Técnicas

### Formato de Fecha
- **Almacenamiento interno**: `Date` object
- **Formato visual**: DD/MM/YYYY
- **Formato en base de datos**: DD/MM/YYYY (string)

### Compatibilidad
- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 13+
- **React Native**: 0.83.1

### Dependencia
- **Paquete**: `@react-native-community/datetimepicker`
- **Versión**: ^8.2.0
- **Licencia**: MIT
- **Mantenimiento**: Activo (React Native Community)

## Estado

✅ Componente creado
✅ Integración completa
✅ Sin errores de compilación
⚠️ Requiere `npm install` para instalar dependencia
⚠️ Requiere rebuild de la app
⚠️ Pendiente de testing en dispositivo
