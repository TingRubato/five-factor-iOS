import React from 'react';
import Svg, { Polygon, Line, Circle, Defs, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/theme';

const DIMS = ['O', 'C', 'E', 'A', 'N'] as const;
const RINGS = [25, 50, 75, 100] as const;

interface RadarChartProps {
  /** OCEAN scores as a record, e.g. { O: 72, C: 55, E: 80, A: 60, N: 30 } */
  scores: Record<string, number>;
  /** Overall SVG canvas size in dp (width = height) */
  size: number;
  /** Color used for the data polygon stroke, fill, and data-point dots */
  color: string;
  /**
   * Phase-1 "blurred" mode — dashed outline polygon, low-opacity fill,
   * no data-point dots.  Mirrors what profile.tsx calls "isPhase1".
   * @default false
   */
  blurred?: boolean;
  /**
   * Whether to render the O/C/E/A/N axis labels.
   * @default true
   */
  showLabels?: boolean;
  /**
   * Whether to render small circles at each data point.
   * Ignored when blurred=true (dots are never shown in blurred mode).
   * @default true
   */
  showDataPoints?: boolean;
  /**
   * Radius ratio relative to half the canvas size (center).
   * result.tsx uses 0.72, profile.tsx / user/[id].tsx use 0.68.
   * @default 0.68
   */
  radiusRatio?: number;
  /**
   * Label offset beyond the outer ring edge in dp.
   * result.tsx: 20, profile.tsx: 22, user/[id].tsx: 18.
   * @default 20
   */
  labelOffset?: number;
  /**
   * Whether to dash inner grid rings (rings with pct < 100).
   * result.tsx and user/[id].tsx dash all inner rings;
   * profile.tsx dashes only the outer rings when in phase1 mode.
   * Pass a function to get per-ring control.
   * @default false
   */
  dashedRings?: boolean | ((pct: number) => boolean);
  /**
   * When true, renders a RadialGradient fill behind the chart
   * (result.tsx uses this for the glow effect).
   * @default false
   */
  showGradient?: boolean;
}

export default function RadarChart({
  scores,
  size,
  color,
  blurred = false,
  showLabels = true,
  showDataPoints = true,
  radiusRatio = 0.68,
  labelOffset = 20,
  dashedRings = false,
  showGradient = false,
}: RadarChartProps) {
  const center = size / 2;
  const radius = center * radiusRatio;
  const count = DIMS.length;

  /** Cartesian (x,y) for a given dimension index and 0-100 value */
  const getPoint = (index: number, value: number) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const dist = (value / 100) * radius;
    return {
      x: center + dist * Math.cos(angle),
      y: center + dist * Math.sin(angle),
    };
  };

  /** Polygon points string for a ring at given percentage */
  const ringPoints = (pct: number) =>
    DIMS.map((_, i) => {
      const a = (Math.PI * 2 * i) / count - Math.PI / 2;
      const d = (pct / 100) * radius;
      return `${center + d * Math.cos(a)},${center + d * Math.sin(a)}`;
    }).join(' ');

  /** Polygon points string for the actual data */
  const dataPolyPoints = DIMS.map((d, i) => {
    const p = getPoint(i, scores[d] ?? 50);
    return `${p.x},${p.y}`;
  }).join(' ');

  /** Resolve whether a given ring should be dashed */
  const isRingDashed = (pct: number): boolean => {
    if (typeof dashedRings === 'function') return dashedRings(pct);
    return dashedRings && pct < 100;
  };

  // Blurred mode polygon styling
  const polyFill = blurred
    ? `${color}0F`          // ~6% opacity
    : `${color}18`;         // ~9% opacity (hex 18 = 24, ~9.4%)
  const polyStroke = blurred ? `${color}4D` : color; // ~30% vs full opacity
  const polyStrokeWidth = blurred ? 1 : 1.5;
  const polyDash = blurred ? '5,5' : undefined;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Optional radial gradient fill for glow effect */}
      {showGradient && (
        <Defs>
          <RadialGradient id="rcGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
      )}

      {/* Grid rings */}
      {RINGS.map((pct) => (
        <Polygon
          key={pct}
          points={ringPoints(pct)}
          fill="none"
          stroke={Colors.line}
          strokeWidth={0.5}
          strokeDasharray={isRingDashed(pct) ? '3,3' : undefined}
        />
      ))}

      {/* Axis lines */}
      {DIMS.map((_, i) => {
        const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
        return (
          <Line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke={Colors.line}
            strokeWidth={0.5}
          />
        );
      })}

      {/* Data polygon */}
      <Polygon
        points={dataPolyPoints}
        fill={polyFill}
        stroke={polyStroke}
        strokeWidth={polyStrokeWidth}
        strokeDasharray={polyDash}
      />

      {/* Data point dots */}
      {!blurred && showDataPoints &&
        DIMS.map((d, i) => {
          const p = getPoint(i, scores[d] ?? 50);
          return (
            <Circle
              key={d}
              cx={p.x}
              cy={p.y}
              r={3}
              fill={color}
            />
          );
        })}

      {/* Axis labels (O / C / E / A / N) */}
      {showLabels &&
        DIMS.map((dim, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          return (
            <SvgText
              key={dim}
              x={center + (radius + labelOffset) * Math.cos(angle)}
              y={center + (radius + labelOffset) * Math.sin(angle) + 4}
              fill={Colors.t2}
              fontSize={10}
              fontWeight="600"
              textAnchor="middle"
            >
              {dim}
            </SvgText>
          );
        })}
    </Svg>
  );
}
