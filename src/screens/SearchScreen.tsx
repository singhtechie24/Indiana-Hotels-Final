import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RoomCard } from '../components/RoomCard';
import { Room, RoomType, RoomFilters } from '../types/room';
import { rooms } from '../data/rooms';

type SearchScreenNavigationProp = NativeStackNavigationProp<MainTabParamList, 'Search'>;

const roomTypes: RoomType[] = ['single', 'double', 'suite', 'deluxe'];

export const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [activeFilter, setActiveFilter] = useState<RoomType | null>(null);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);

  const handleFilterPress = useCallback((type: RoomType) => {
    setActiveFilter(activeFilter === type ? null : type);
    setFilteredRooms(
      activeFilter === type
        ? rooms
        : rooms.filter(room => room.type === type)
    );
  }, [activeFilter]);

  const handleRoomPress = (room: Room) => {
    navigation.navigate('RoomDetails', { roomId: room.id });
  };

  const renderRoomTypeFilter = ({ item }: { item: RoomType }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        activeFilter === item && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterPress(item)}
    >
      <Text
        style={[
          styles.filterButtonText,
          activeFilter === item && styles.filterButtonTextActive,
        ]}
      >
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Room</Text>
        <Text style={styles.subtitle}>
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={roomTypes}
          renderItem={renderRoomTypeFilter}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      <FlatList
        data={filteredRooms}
        renderItem={({ item }) => (
          <RoomCard room={item} onPress={handleRoomPress} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.roomsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray,
  },
  filtersContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.md,
  },
  filtersList: {
    paddingHorizontal: SPACING.xl,
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  roomsList: {
    padding: SPACING.xl,
  },
}); 