import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { DEMO_NOTIFICATIONS, DemoNotification } from '@/constants/demoNotifications';
import { Colors } from '@/constants/colors';
import { Design } from '@/constants/design';

const PANEL_MAX_WIDTH = 340;
const PANEL_WIDTH_RATIO = 0.85;
const BELL_SIZE = 42;
const DROPDOWN_TOP_GAP = 8;

function NotificationRow({ item }: { item: DemoNotification }) {
  return (
    <View style={[styles.row, !item.read && styles.rowUnread]}>
      <View style={[styles.rowIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={16} color={item.iconColor} />
      </View>
      <View style={styles.rowCopy}>
        <View style={styles.rowTitleLine}>
          <AppText style={styles.rowTitle} numberOfLines={2}>
            {item.title}
          </AppText>
          {!item.read ? <View style={styles.unreadDot} /> : null}
        </View>
        <AppText style={styles.rowBody} numberOfLines={2}>
          {item.body}
        </AppText>
        <AppText style={styles.rowTime}>{item.timeLabel}</AppText>
      </View>
    </View>
  );
}

export function HomeNotificationsBell() {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<DemoNotification[]>(() =>
    DEMO_NOTIFICATIONS.map((item) => ({ ...item })),
  );

  const panelWidth = Math.min(screenWidth * PANEL_WIDTH_RATIO, PANEL_MAX_WIDTH);
  const dropdownTop = insets.top + 12 + BELL_SIZE + DROPDOWN_TOP_GAP;

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  const toggleOpen = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  return (
    <>
      <Pressable
        style={styles.bell}
        hitSlop={8}
        onPress={toggleOpen}
        accessibilityRole="button"
        accessibilityLabel="Notifiche"
        accessibilityState={{ expanded: open }}
      >
        <Ionicons
          name={open ? 'notifications' : 'notifications-outline'}
          size={21}
          color={Colors.white}
        />
        {unreadCount > 0 ? <View style={styles.badge} /> : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Chiudi notifiche" />

          <View
            style={[
              styles.panel,
              {
                top: dropdownTop,
                right: Design.spacing.screen,
                width: panelWidth,
              },
            ]}
          >
            <View style={styles.panelHeader}>
              <AppText style={styles.panelTitle}>Notifiche</AppText>
              <Pressable
                onPress={markAllRead}
                hitSlop={6}
                disabled={unreadCount === 0}
                style={({ pressed }) => [pressed && styles.pressed]}
              >
                <AppText
                  style={[
                    styles.markAll,
                    unreadCount === 0 && styles.markAllDisabled,
                  ]}
                >
                  Segna tutte come lette
                </AppText>
              </Pressable>
            </View>

            <ScrollView
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {items.map((item, index) => (
                <View key={item.id}>
                  <NotificationRow item={item} />
                  {index < items.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bell: {
    width: BELL_SIZE,
    height: BELL_SIZE,
    borderRadius: BELL_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: '#031f42',
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(1, 13, 32, 0.22)',
  },
  panel: {
    position: 'absolute',
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 360,
    ...Design.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    overflow: 'hidden',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  markAll: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    letterSpacing: -0.1,
  },
  markAllDisabled: {
    opacity: 0.45,
  },
  list: {
    maxHeight: 300,
  },
  listContent: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  rowUnread: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  rowTitleLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  rowTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.accent,
    marginTop: 5,
    flexShrink: 0,
  },
  rowBody: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  rowTime: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    opacity: 0.75,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 58,
    marginRight: 14,
  },
  pressed: {
    opacity: 0.7,
  },
});
