# Sincronización de Versión en LoginScreen

## Cambio Realizado

Se actualizó el `LoginScreen` para que muestre dinámicamente la versión de la app desde el `package.json` en lugar de tener un número hardcodeado.

## Antes

```typescript
<Text style={styles.footerText}>
  © 2026 Prescriptor Pro • Versión 2.1.0
</Text>
```

**Problema**: La versión estaba hardcodeada como "2.1.0" y no se actualizaba automáticamente.

## Después

```typescript
import { version } from '../../package.json';

// ...

<Text style={styles.footerText}>
  © 2026 Prescriptor Pro • Versión {version}
</Text>
```

**Solución**: Ahora la versión se importa dinámicamente del `package.json` y se actualiza automáticamente.

## Configuración de TypeScript

Para permitir la importación de archivos JSON, se agregaron las siguientes opciones al `tsconfig.json`:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

## Resultado

Ahora, cuando se muestra el LoginScreen, la versión mostrada será:

- **Versión actual**: 0.0.3
- **Texto mostrado**: "© 2026 Prescriptor Pro • Versión 0.0.3"

## Beneficios

1. **Sincronización automática**: La versión en el LoginScreen siempre coincide con la versión del `package.json`

2. **Sin mantenimiento manual**: No es necesario actualizar manualmente el LoginScreen cuando se incrementa la versión

3. **Consistencia**: La versión mostrada al usuario siempre es la correcta

## Flujo de Actualización

Cuando se incrementa la versión:

```bash
# Incrementar versión
npm run version:patch  # 0.0.3 → 0.0.4

# El LoginScreen automáticamente mostrará "Versión 0.0.4"
```

## Verificación

Para verificar que funciona correctamente:

1. **Abre la app**
2. **Ve al LoginScreen, RegisterScreen o SettingsScreen**
3. **Verifica el footer/versión**: Debería mostrar "Versión 0.0.5" (o la versión actual del package.json)

## Archivos Modificados

- `apps/mobile/src/screens/LoginScreen.tsx` - Importa y usa la versión del package.json
- `apps/mobile/src/screens/RegisterScreen.tsx` - Importa y usa la versión del package.json
- `apps/mobile/src/services/ProfileService.ts` - Importa y usa la versión del package.json (para SettingsScreen)
- `apps/mobile/tsconfig.json` - Habilita `resolveJsonModule` y `esModuleInterop`

## Próximas Versiones

Cuando se genere la próxima release:

| Versión | Comando | Texto Mostrado |
|---------|---------|----------------|
| 0.0.4 | `npm run version:patch` | "Versión 0.0.4" |
| 0.1.0 | `npm run version:minor` | "Versión 0.1.0" |
| 1.0.0 | `npm run version:major` | "Versión 1.0.0" |

## Notas Técnicas

### Por qué funciona

React Native Metro bundler incluye el `package.json` en el bundle cuando se importa, y TypeScript ahora puede validar el tipo gracias a `resolveJsonModule`.

### Alternativas consideradas

1. **Usar react-native-device-info**: Más complejo, requiere dependencia adicional
2. **Crear un archivo de configuración**: Duplicación de información
3. **Importar directamente del package.json**: ✅ Solución elegida (simple y efectiva)

### Compatibilidad

- ✅ React Native 0.83.1
- ✅ TypeScript 5.8.3
- ✅ Metro bundler
- ✅ Android
- ✅ iOS

---

**Fecha de actualización**: 25 de febrero de 2026
**Versión actual**: 0.0.3
**Estado**: ✅ Implementado y funcionando
