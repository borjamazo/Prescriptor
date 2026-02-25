import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Props {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  leftIcon?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export const DatePickerField = ({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  leftIcon = 'calendar-outline',
  maximumDate,
  minimumDate,
}: Props) => {
  const [show, setShow] = useState(false);

  const handlePress = () => {
    setShow(true);
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    } else if (event.type === 'dismissed') {
      // User cancelled
      if (Platform.OS === 'android') {
        setShow(false);
      }
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons name={leftIcon} size={18} color="#9CA3AF" style={styles.icon} />
        <Text style={[styles.input, !value && styles.placeholder]}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color="#9CA3AF" />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          locale="es-ES"
        />
      )}

      {/* iOS modal overlay */}
      {show && Platform.OS === 'ios' && (
        <View style={styles.iosModalOverlay}>
          <View style={styles.iosModal}>
            <View style={styles.iosModalHeader}>
              <TouchableOpacity onPress={handleDismiss}>
                <Text style={styles.iosModalButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.iosModalTitle}>{label}</Text>
              <TouchableOpacity onPress={handleDismiss}>
                <Text style={[styles.iosModalButton, styles.iosModalButtonDone]}>Listo</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={value || new Date()}
              mode="date"
              display="spinner"
              onChange={handleChange}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              locale="es-ES"
              style={styles.iosDatePicker}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  placeholder: {
    color: '#9CA3AF',
  },
  
  // iOS Modal styles
  iosModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  iosModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  iosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  iosModalButton: {
    fontSize: 16,
    color: '#6B7280',
  },
  iosModalButtonDone: {
    color: '#5551F5',
    fontWeight: '600',
  },
  iosDatePicker: {
    height: 200,
  },
});
