import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

interface MiniLineChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export function MiniLineChart({ data, width = 148, height = 36 }: MiniLineChartProps) {
  const points = data.slice(-7);
  const chartWidth = Math.max(width, 0);
  const chartHeight = Math.max(height, 0);
  const dotPad = 5;

  if (points.length < 2) {
    return <View style={[styles.wrap, { width: chartWidth, height: chartHeight }]} />;
  }

  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = max - min || 1;
  const innerWidth = Math.max(chartWidth - dotPad * 2, 1);
  const innerHeight = Math.max(chartHeight - dotPad * 2, 1);

  const coords = points.map((value, index) => ({
    x: dotPad + (index / (points.length - 1)) * innerWidth,
    y: dotPad + innerHeight - ((value - min) / range) * (innerHeight - 4),
  }));

  return (
    <View style={[styles.wrap, { width: chartWidth, height: chartHeight }]}>
      {coords.map((point, index) => {
        if (index === 0) return null;
        const prev = coords[index - 1];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <View
            key={`line-${index}`}
            style={[
              styles.line,
              {
                width: length,
                left: prev.x,
                top: prev.y,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
      {coords.map((point, index) => {
        const isLast = index === coords.length - 1;
        const size = isLast ? 8 : 4;
        return (
          <View
            key={`dot-${index}`}
            style={[
              styles.dot,
              isLast ? styles.dotActive : styles.dotMuted,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                left: point.x - size / 2,
                top: point.y - size / 2,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  line: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.success,
    transformOrigin: 'left center',
    borderRadius: 1,
  },
  dot: {
    position: 'absolute',
  },
  dotMuted: {
    backgroundColor: 'rgba(16, 185, 129, 0.35)',
  },
  dotActive: {
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
