import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface BaseProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  subtitle?: string;
  showSeparator?: boolean;
}

interface ChevronProps extends BaseProps {
  type: 'chevron';
  onPress?: () => void;
}

interface ToggleProps extends BaseProps {
  type: 'toggle';
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface TextProps extends BaseProps {
  type: 'text';
}

type Props = ChevronProps | ToggleProps | TextProps;

export const SettingsRow = (props: Props) => {
  const { icon, iconBg, iconColor, label, subtitle, showSeparator = true } = props;

  const inner = (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.label}>{label}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {props.type === 'chevron' ? (
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      ) : props.type === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ false: '#E5E7EB', true: '#111827' }}
          thumbColor="#ffffff"
        />
      ) : null}
    </View>
  );

  return (
    <>
      {props.type === 'chevron' ? (
        <TouchableOpacity onPress={props.onPress} activeOpacity={0.7}>
          {inner}
        </TouchableOpacity>
      ) : (
        inner
      )}
      {showSeparator && <View style={styles.separator} />}
    </>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  // Aligned with the text column (16 pad + 40 icon + 14 gap)
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 70,
  },
});
