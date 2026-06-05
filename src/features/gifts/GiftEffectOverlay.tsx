import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';

export type GiftEffect = {
  id: number;
  badge: string;
  title: string;
  detail: string;
  accentColor?: string;
};

const particleOffsets = [-54, -28, 0, 28, 54];

export function GiftEffectOverlay({ effect, top = 12 }: { effect: GiftEffect; top?: number }) {
  const entrance = useRef(new Animated.Value(0)).current;
  const particle = useRef(new Animated.Value(0)).current;
  const accentColor = effect.accentColor || '#d4af37';

  useEffect(() => {
    entrance.setValue(0);
    particle.setValue(0);

    Animated.parallel([
      Animated.timing(entrance, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle, {
            toValue: 1,
            duration: 1100,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 850,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 },
      ),
    ]).start();
  }, [effect.id, entrance, particle]);

  const translateY = entrance.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 0],
  });
  const scale = entrance.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0.96, 1.02, 1],
  });
  const opacity = entrance.interpolate({
    inputRange: [0, 0.15, 1],
    outputRange: [0, 1, 1],
  });
  const particleLift = particle.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -10],
  });
  const particleOpacity = particle.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0.35, 1, 0.2],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        left: 16,
        opacity,
        position: 'absolute',
        right: 16,
        top,
        transform: [{ translateY }, { scale }],
        zIndex: 20,
      }}
    >
      <View
        style={{
          backgroundColor: '#17030c',
          borderColor: accentColor,
          borderRadius: 16,
          borderWidth: 1,
          overflow: 'hidden',
          padding: 12,
        }}
      >
        <View
          style={{
            backgroundColor: accentColor,
            height: 3,
            left: 0,
            opacity: 0.85,
            position: 'absolute',
            right: 0,
            top: 0,
          }}
        />
        <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
            {effect.badge}
          </Text>
          <Animated.View
            style={{
              flexDirection: 'row',
              opacity: particleOpacity,
              transform: [{ translateY: particleLift }],
            }}
          >
            {particleOffsets.map((offset) => (
              <View
                key={offset}
                style={{
                  backgroundColor: accentColor,
                  borderRadius: 999,
                  height: 4,
                  marginLeft: 6,
                  opacity: Math.abs(offset) === 54 ? 0.45 : 0.8,
                  width: 4,
                }}
              />
            ))}
          </Animated.View>
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 3 }}>{effect.title}</Text>
        <Text style={{ color: '#ff9abf', fontSize: 12, marginTop: 4 }}>{effect.detail}</Text>
      </View>
    </Animated.View>
  );
}
