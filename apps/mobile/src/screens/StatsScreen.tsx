import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  G,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {
  MedSegment,
  MonthlyPoint,
  StatsData,
  WeeklyBar,
} from '../services/StatsService';
import { StatsService } from '../services/StatsService';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_PADDING = 16;
const SCREEN_PADDING = 16;
const CHART_W = SCREEN_W - SCREEN_PADDING * 2 - CARD_PADDING * 2;

// ─── Bar Chart ────────────────────────────────────────────────────

const BAR_AREA_H = 140;
const BAR_LABEL_H = 20;

const BarChart = ({ data }: { data: WeeklyBar[] }) => {
  const maxVal = Math.max(...data.map(d => d.count));
  const slotW = CHART_W / data.length;
  const barW = slotW * 0.55;

  return (
    <Svg width={CHART_W} height={BAR_AREA_H + BAR_LABEL_H + 4}>
      {data.map((d, i) => {
        const bh = (d.count / maxVal) * BAR_AREA_H;
        const x = i * slotW + (slotW - barW) / 2;
        const y = BAR_AREA_H - bh;
        const isMax = d.count === maxVal;
        return (
          <G key={d.day}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={bh}
              fill={isMax ? '#5551F5' : '#C7D2FE'}
              rx={5}
            />
            <SvgText
              x={x + barW / 2}
              y={BAR_AREA_H + BAR_LABEL_H}
              textAnchor="middle"
              fontSize={11}
              fill="#9CA3AF"
            >
              {d.day}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
};

// ─── Line Chart ───────────────────────────────────────────────────

const LINE_AREA_H = 130;
const LINE_LABEL_H = 20;
const LINE_PAD = 8;
const GRID_COUNT = 4;

const LineChart = ({ data }: { data: MonthlyPoint[] }) => {
  const allVals = data.flatMap(d => [d.signed, d.pending]);
  const maxVal = Math.max(...allVals);
  const usableW = CHART_W - LINE_PAD * 2;
  const usableH = LINE_AREA_H - 12;

  const xOf = (i: number) =>
    LINE_PAD + (i / (data.length - 1)) * usableW;
  const yOf = (val: number) =>
    8 + usableH - (val / maxVal) * usableH;

  const signedPts = data.map((d, i) => `${xOf(i)},${yOf(d.signed)}`).join(' ');
  const pendingPts = data.map((d, i) => `${xOf(i)},${yOf(d.pending)}`).join(' ');

  return (
    <Svg width={CHART_W} height={LINE_AREA_H + LINE_LABEL_H + 4}>
      {/* Grid lines */}
      {Array.from({ length: GRID_COUNT }).map((_, gi) => {
        const y = 8 + (gi / (GRID_COUNT - 1)) * usableH;
        return (
          <Line
            key={gi}
            x1={LINE_PAD}
            y1={y}
            x2={CHART_W - LINE_PAD}
            y2={y}
            stroke="#F3F4F6"
            strokeWidth={1}
          />
        );
      })}

      {/* Lines */}
      <Polyline
        points={signedPts}
        fill="none"
        stroke="#5551F5"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Polyline
        points={pendingPts}
        fill="none"
        stroke="#F59E0B"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots */}
      {data.map((d, i) => (
        <G key={d.month}>
          <Circle cx={xOf(i)} cy={yOf(d.signed)} r={4} fill="#5551F5" />
          <Circle cx={xOf(i)} cy={yOf(d.pending)} r={4} fill="#F59E0B" />
        </G>
      ))}

      {/* X labels */}
      {data.map((d, i) => (
        <SvgText
          key={`lbl-${d.month}`}
          x={xOf(i)}
          y={LINE_AREA_H + LINE_LABEL_H}
          textAnchor="middle"
          fontSize={11}
          fill="#9CA3AF"
        >
          {d.month}
        </SvgText>
      ))}
    </Svg>
  );
};

// ─── Donut Chart ──────────────────────────────────────────────────

const DONUT_R = 52;
const DONUT_SW = 22;
const DONUT_SIZE = (DONUT_R + DONUT_SW / 2 + 6) * 2;
const DONUT_CX = DONUT_SIZE / 2;
const DONUT_CY = DONUT_SIZE / 2;

const DonutChart = ({ data }: { data: MedSegment[] }) => {
  const circumference = 2 * Math.PI * DONUT_R;
  let cumulative = 0;

  return (
    <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
      {/* Track */}
      <Circle
        cx={DONUT_CX}
        cy={DONUT_CY}
        r={DONUT_R}
        fill="none"
        stroke="#F3F4F6"
        strokeWidth={DONUT_SW}
      />
      <G rotation={-90} origin={`${DONUT_CX}, ${DONUT_CY}`}>
        {data.map(seg => {
          const arcLen = (seg.percentage / 100) * circumference;
          const dashOffset = -cumulative;
          cumulative += arcLen;
          return (
            <Circle
              key={seg.name}
              cx={DONUT_CX}
              cy={DONUT_CY}
              r={DONUT_R}
              fill="none"
              stroke={seg.color}
              strokeWidth={DONUT_SW}
              strokeDasharray={[arcLen, circumference - arcLen]}
              strokeDashoffset={dashOffset}
            />
          );
        })}
      </G>
      {/* Center text */}
      <SvgText
        x={DONUT_CX}
        y={DONUT_CY - 4}
        textAnchor="middle"
        fontSize={22}
        fontWeight="bold"
        fill="#111827"
      >
        189
      </SvgText>
      <SvgText
        x={DONUT_CX}
        y={DONUT_CY + 16}
        textAnchor="middle"
        fontSize={11}
        fill="#9CA3AF"
      >
        Total
      </SvgText>
    </Svg>
  );
};

// ─── Metric Card ──────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  count: number;
  change: number;
  subtitle: string;
}

const MetricCard = ({ label, count, change, subtitle }: MetricCardProps) => {
  const positive = change >= 0;
  const changeColor = positive ? '#059669' : '#EF4444';
  const icon = positive ? 'trending-up-outline' : 'trending-down-outline';
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricCount}>{count}</Text>
      <View style={styles.metricChangeRow}>
        <Ionicons name={icon} size={14} color={changeColor} />
        <Text style={[styles.metricChange, { color: changeColor }]}>
          {positive ? '+' : ''}
          {change}%
        </Text>
      </View>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────

export const StatsScreen = () => {
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    StatsService.getStats().then(setStats);
  }, []);

  if (!stats) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Estadísticas</Text>
            <Text style={styles.headerSubtitle}>Resumen de tus prescripciones</Text>
          </View>
          <View style={styles.headerIconWrap}>
            <Ionicons name="pulse-outline" size={22} color="#5551F5" />
          </View>
        </View>

        {/* Metric cards */}
        <View style={styles.metricRow}>
          <MetricCard
            label="Esta Semana"
            count={stats.thisWeek.count}
            change={stats.thisWeek.change}
            subtitle="desde la semana pasada"
          />
          <MetricCard
            label="Este Mes"
            count={stats.thisMonth.count}
            change={stats.thisMonth.change}
            subtitle="desde enero"
          />
        </View>

        {/* Weekly Activity */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actividad Semanal</Text>
          <View style={styles.chartWrap}>
            <BarChart data={stats.weeklyActivity} />
          </View>
        </View>

        {/* Monthly Comparison */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Comparación Mensual</Text>
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#5551F5' }]} />
                <Text style={styles.legendText}>Firmadas</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.legendText}>Pendientes</Text>
              </View>
            </View>
          </View>
          <View style={styles.chartWrap}>
            <LineChart data={stats.monthlyComparison} />
          </View>
        </View>

        {/* Medication Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Medication Distribution</Text>
          <View style={styles.donutRow}>
            <DonutChart data={stats.medicationDistribution} />
            <View style={styles.donutLegend}>
              {stats.medicationDistribution.map(seg => (
                <View key={seg.name} style={styles.donutLegendItem}>
                  <View
                    style={[styles.donutLegendDot, { backgroundColor: seg.color }]}
                  />
                  <View>
                    <Text style={styles.donutLegendName}>{seg.name}</Text>
                    <Text style={styles.donutLegendPct}>{seg.percentage}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SCREEN_PADDING,
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Metric cards
  metricRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  metricCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  metricChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 13,
    fontWeight: '600',
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: CARD_PADDING,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  chartWrap: {
    alignItems: 'center',
  },

  // Legend (line chart)
  legend: {
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Donut section
  donutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  donutLegend: {
    flex: 1,
    gap: 12,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  donutLegendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  donutLegendName: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  donutLegendPct: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 1,
  },
});
