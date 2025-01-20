import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Text, Card, Button, Chip, Searchbar, Menu, Portal, Modal } from 'react-native-paper';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { getAllRooms, updateRoom } from '../services/FirestoreService';
import type { Room } from '../services/FirestoreService';

type FilterStatus = 'all' | 'available' | 'occupied' | 'cleaning' | 'maintenance';

export const RoomManagementScreen = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const allRooms = await getAllRooms();
      setRooms(allRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleUpdateStatus = async (roomId: string, newStatus: Room['status']) => {
    try {
      await updateRoom(roomId, { 
        status: newStatus,
        lastUpdated: new Date(),
        updatedBy: user?.uid
      });
      await fetchRooms();
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return COLORS.success;
      case 'occupied':
        return COLORS.warning;
      case 'cleaning':
        return COLORS.info;
      case 'maintenance':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const filteredRooms = rooms
    .filter(room => 
      statusFilter === 'all' || room.status === statusFilter
    )
    .filter(room =>
      room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.number.localeCompare(b.number));

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Room Management</Text>
          <Searchbar
            placeholder="Search rooms..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                onPress={() => setMenuVisible(true)}
                style={styles.filterButton}
              >
                Filter: {statusFilter.toUpperCase()}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setStatusFilter('all'); setMenuVisible(false); }} title="All" />
            <Menu.Item onPress={() => { setStatusFilter('available'); setMenuVisible(false); }} title="Available" />
            <Menu.Item onPress={() => { setStatusFilter('occupied'); setMenuVisible(false); }} title="Occupied" />
            <Menu.Item onPress={() => { setStatusFilter('cleaning'); setMenuVisible(false); }} title="Cleaning" />
            <Menu.Item onPress={() => { setStatusFilter('maintenance'); setMenuVisible(false); }} title="Maintenance" />
          </Menu>
        </View>

        <View style={styles.content}>
          {filteredRooms.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No rooms found</Text>
            </View>
          ) : (
            filteredRooms.map((room) => (
              <Card 
                key={room.id} 
                style={styles.card}
                onPress={() => {
                  setSelectedRoom(room);
                  setModalVisible(true);
                }}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.roomNumber}>Room {room.number}</Text>
                    <Chip 
                      mode="outlined" 
                      style={[styles.statusChip, { borderColor: getStatusColor(room.status) }]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(room.status) }]}>
                        {room.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>

                  <View style={styles.roomInfo}>
                    <Text style={styles.roomType}>{room.type}</Text>
                    <Text style={styles.price}>£{room.price}/night</Text>
                  </View>

                  <View style={styles.actions}>
                    {room.status !== 'available' && (
                      <Button
                        mode="contained"
                        onPress={() => handleUpdateStatus(room.id, 'available')}
                        style={styles.actionButton}
                      >
                        Mark Available
                      </Button>
                    )}
                    {room.status !== 'cleaning' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateStatus(room.id, 'cleaning')}
                        style={styles.actionButton}
                      >
                        Mark Cleaning
                      </Button>
                    )}
                    {room.status !== 'maintenance' && (
                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateStatus(room.id, 'maintenance')}
                        style={[styles.actionButton, styles.maintenanceButton]}
                      >
                        Maintenance
                      </Button>
                    )}
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setSelectedRoom(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRoom && (
            <View>
              <Text style={styles.modalTitle}>Room {selectedRoom.number} Details</Text>
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Type:</Text>
                <Text style={styles.modalValue}>{selectedRoom.type}</Text>
                
                <Text style={styles.modalLabel}>Price:</Text>
                <Text style={styles.modalValue}>£{selectedRoom.price}/night</Text>
                
                <Text style={styles.modalLabel}>Status:</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.statusChip, { borderColor: getStatusColor(selectedRoom.status) }]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(selectedRoom.status) }]}>
                    {selectedRoom.status.toUpperCase()}
                  </Text>
                </Chip>

                <Text style={styles.modalLabel}>Last Updated:</Text>
                <Text style={styles.modalValue}>
                  {selectedRoom.lastUpdated ? new Date(selectedRoom.lastUpdated).toLocaleString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.modalActions}>
                <Button
                  mode="contained"
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedRoom(null);
                  }}
                >
                  Close
                </Button>
              </View>
            </View>
          )}
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  searchBar: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    marginTop: SPACING.xs,
  },
  content: {
    padding: SPACING.md,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray,
  },
  card: {
    marginBottom: SPACING.md,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  roomNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
  },
  statusChip: {
    borderWidth: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  roomInfo: {
    marginVertical: SPACING.sm,
  },
  roomType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    minWidth: 100,
  },
  maintenanceButton: {
    borderColor: COLORS.error,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    margin: SPACING.lg,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalContent: {
    marginVertical: SPACING.md,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray,
    marginBottom: SPACING.xs,
  },
  modalValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.md,
  },
}); 