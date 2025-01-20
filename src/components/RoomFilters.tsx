import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';
import { RoomType } from '../types/room';
import { Ionicons } from '@expo/vector-icons';

interface RoomFiltersProps {
  roomTypes: RoomType[];
  activeRoomType: RoomType | null;
  minPrice: number;
  maxPrice: number;
  selectedMinPrice: number;
  selectedMaxPrice: number;
  capacity: number;
  onRoomTypePress: (type: RoomType) => void;
  onPriceChange: (min: number, max: number) => void;
  onCapacityChange: (capacity: number) => void;
  onResetFilters: () => void;
}

export const RoomFilters: React.FC<RoomFiltersProps> = ({
  roomTypes,
  activeRoomType,
  minPrice,
  maxPrice,
  selectedMinPrice,
  selectedMaxPrice,
  capacity,
  onRoomTypePress,
  onPriceChange,
  onCapacityChange,
  onResetFilters,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [localMinPrice, setLocalMinPrice] = useState(selectedMinPrice.toString());
  const [localMaxPrice, setLocalMaxPrice] = useState(selectedMaxPrice.toString());
  const [localCapacity, setLocalCapacity] = useState(capacity);
  
  const hasActiveFilters = selectedMinPrice > minPrice || 
    selectedMaxPrice < maxPrice || 
    capacity > 1;

  const handleResetFilters = () => {
    setLocalMinPrice(minPrice.toString());
    setLocalMaxPrice(maxPrice.toString());
    setLocalCapacity(1);
    onResetFilters();
    setShowFilters(false);
  };

  const handleApplyFilters = () => {
    const min = Math.max(minPrice, parseInt(localMinPrice) || 0);
    const max = Math.min(maxPrice, parseInt(localMaxPrice) || maxPrice);
    onPriceChange(min, max);
    onCapacityChange(localCapacity);
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersList}
      >
        <View style={styles.filterButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeRoomType === null && styles.filterButtonActive,
            ]}
            onPress={() => onRoomTypePress(null as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                activeRoomType === null && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {roomTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                activeRoomType === type && styles.filterButtonActive,
              ]}
              onPress={() => onRoomTypePress(type)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeRoomType === type && styles.filterButtonTextActive,
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons 
              name="options-outline" 
              size={20} 
              color={hasActiveFilters ? COLORS.white : COLORS.gray} 
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.priceInputContainer}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.currencySymbol}>£</Text>
                  <TextInput
                    style={styles.input}
                    value={localMinPrice}
                    onChangeText={setLocalMinPrice}
                    keyboardType="numeric"
                    placeholder="Min"
                    maxLength={6}
                  />
                </View>
                <View style={styles.separatorContainer}>
                  <View style={styles.priceSeparator} />
                </View>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.currencySymbol}>£</Text>
                  <TextInput
                    style={styles.input}
                    value={localMaxPrice}
                    onChangeText={setLocalMaxPrice}
                    keyboardType="numeric"
                    placeholder="Max"
                    maxLength={6}
                  />
                </View>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Guests</Text>
              <View style={styles.capacityContainer}>
                <TouchableOpacity
                  style={styles.capacityButton}
                  onPress={() => setLocalCapacity(Math.max(1, localCapacity - 1))}
                >
                  <Ionicons name="remove" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.capacityValue}>{localCapacity}</Text>
                <TouchableOpacity
                  style={styles.capacityButton}
                  onPress={() => setLocalCapacity(localCapacity + 1)}
                >
                  <Ionicons name="add" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetFilters}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
  },
  filtersList: {
    paddingHorizontal: SPACING.md,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray,
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.text,
  },
  filterSection: {
    marginBottom: SPACING.xl,
    width: '100%',
  },
  filterLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  priceInputWrapper: {
    flex: 1,
    maxWidth: '45%',
  },
  separatorContainer: {
    width: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    width: '100%',
  },
  priceSeparator: {
    width: 20,
    height: 2,
    backgroundColor: COLORS.gray,
    marginTop: 20,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  capacityButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  capacityValue: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.text,
    minWidth: 30,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  resetButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resetButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.white,
  },
}); 