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
import { 
  ServiceRequest, 
  ServiceRequestType,
  ServiceRequestStatus,
  getServiceRequests, 
  updateServiceRequest,
  getServiceRequestsByRoom
} from '../services/FirestoreService';

type FilterStatus = ServiceRequestStatus | 'all';
type FilterType = ServiceRequestType | 'all';

export const ServiceRequestsScreen = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [typeMenuVisible, setTypeMenuVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useAuth();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const serviceRequests = await getServiceRequests();
      setRequests(serviceRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleUpdateStatus = async (requestId: string, newStatus: ServiceRequestStatus) => {
    try {
      await updateServiceRequest(requestId, { 
        status: newStatus,
        assignedTo: user?.uid
      });
      await fetchRequests();
      setModalVisible(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating service request:', error);
    }
  };

  const getStatusColor = (status: ServiceRequestStatus) => {
    switch (status) {
      case 'pending':
        return COLORS.warning;
      case 'in-progress':
        return COLORS.info;
      case 'completed':
        return COLORS.success;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.gray;
    }
  };

  const getTypeIcon = (type: ServiceRequestType) => {
    switch (type) {
      case 'housekeeping':
        return '🧹';
      case 'maintenance':
        return '🔧';
      case 'roomService':
        return '🍽️';
      default:
        return '❓';
    }
  };

  const filteredRequests = requests
    .filter(request => 
      (statusFilter === 'all' || request.status === statusFilter) &&
      (typeFilter === 'all' || request.type === typeFilter)
    )
    .filter(request =>
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.roomId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
          <Text style={styles.title}>Service Requests</Text>
          <Searchbar
            placeholder="Search requests..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          <View style={styles.filterContainer}>
            <Menu
              visible={statusMenuVisible}
              onDismiss={() => setStatusMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setStatusMenuVisible(true)}
                  style={styles.filterButton}
                >
                  Status: {statusFilter.toUpperCase()}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setStatusFilter('all'); setStatusMenuVisible(false); }} title="All" />
              <Menu.Item onPress={() => { setStatusFilter('pending'); setStatusMenuVisible(false); }} title="Pending" />
              <Menu.Item onPress={() => { setStatusFilter('in-progress'); setStatusMenuVisible(false); }} title="In Progress" />
              <Menu.Item onPress={() => { setStatusFilter('completed'); setStatusMenuVisible(false); }} title="Completed" />
              <Menu.Item onPress={() => { setStatusFilter('cancelled'); setStatusMenuVisible(false); }} title="Cancelled" />
            </Menu>

            <Menu
              visible={typeMenuVisible}
              onDismiss={() => setTypeMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setTypeMenuVisible(true)}
                  style={styles.filterButton}
                >
                  Type: {typeFilter.toUpperCase()}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setTypeFilter('all'); setTypeMenuVisible(false); }} title="All" />
              <Menu.Item onPress={() => { setTypeFilter('housekeeping'); setTypeMenuVisible(false); }} title="Housekeeping" />
              <Menu.Item onPress={() => { setTypeFilter('maintenance'); setTypeMenuVisible(false); }} title="Maintenance" />
              <Menu.Item onPress={() => { setTypeFilter('roomService'); setTypeMenuVisible(false); }} title="Room Service" />
            </Menu>
          </View>
        </View>

        <View style={styles.content}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No service requests found</Text>
            </View>
          ) : (
            filteredRequests.map((request) => (
              <Card 
                key={request.id} 
                style={styles.card}
                onPress={() => {
                  setSelectedRequest(request);
                  setModalVisible(true);
                }}
              >
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={styles.typeContainer}>
                      <Text style={styles.typeIcon}>{getTypeIcon(request.type)}</Text>
                      <Text style={styles.type}>{request.type.toUpperCase()}</Text>
                    </View>
                    <Chip 
                      mode="outlined" 
                      style={[styles.statusChip, { borderColor: getStatusColor(request.status) }]}
                    >
                      <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                        {request.status.toUpperCase()}
                      </Text>
                    </Chip>
                  </View>

                  <View style={styles.requestInfo}>
                    <Text style={styles.roomId}>Room {request.roomId}</Text>
                    <Text style={styles.description}>{request.description}</Text>
                    <Text style={styles.timestamp}>
                      Created: {request.createdAt.toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    {request.status === 'pending' && (
                      <Button
                        mode="contained"
                        onPress={() => handleUpdateStatus(request.id!, 'in-progress')}
                        style={styles.actionButton}
                      >
                        Start
                      </Button>
                    )}
                    {request.status === 'in-progress' && (
                      <Button
                        mode="contained"
                        onPress={() => handleUpdateStatus(request.id!, 'completed')}
                        style={styles.actionButton}
                      >
                        Complete
                      </Button>
                    )}
                    {(request.status === 'pending' || request.status === 'in-progress') && (
                      <Button
                        mode="outlined"
                        onPress={() => handleUpdateStatus(request.id!, 'cancelled')}
                        style={styles.cancelButton}
                      >
                        Cancel
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
            setSelectedRequest(null);
          }}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRequest && (
            <View>
              <Text style={styles.modalTitle}>Request Details</Text>
              <View style={styles.modalContent}>
                <Text style={styles.modalLabel}>Type:</Text>
                <View style={styles.typeContainer}>
                  <Text style={styles.typeIcon}>{getTypeIcon(selectedRequest.type)}</Text>
                  <Text style={styles.modalValue}>{selectedRequest.type.toUpperCase()}</Text>
                </View>

                <Text style={styles.modalLabel}>Room:</Text>
                <Text style={styles.modalValue}>Room {selectedRequest.roomId}</Text>

                <Text style={styles.modalLabel}>Status:</Text>
                <Chip 
                  mode="outlined" 
                  style={[styles.statusChip, { borderColor: getStatusColor(selectedRequest.status) }]}
                >
                  <Text style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>
                    {selectedRequest.status.toUpperCase()}
                  </Text>
                </Chip>

                <Text style={styles.modalLabel}>Description:</Text>
                <Text style={styles.modalValue}>{selectedRequest.description}</Text>

                <Text style={styles.modalLabel}>Created:</Text>
                <Text style={styles.modalValue}>
                  {selectedRequest.createdAt.toLocaleString()}
                </Text>

                <Text style={styles.modalLabel}>Last Updated:</Text>
                <Text style={styles.modalValue}>
                  {selectedRequest.updatedAt.toLocaleString()}
                </Text>

                {selectedRequest.assignedTo && (
                  <>
                    <Text style={styles.modalLabel}>Assigned To:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.assignedTo}</Text>
                  </>
                )}

                {selectedRequest.notes && (
                  <>
                    <Text style={styles.modalLabel}>Notes:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.notes}</Text>
                  </>
                )}
              </View>
              
              <View style={styles.modalActions}>
                {selectedRequest.status === 'pending' && (
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(selectedRequest.id!, 'in-progress')}
                    style={styles.actionButton}
                  >
                    Start
                  </Button>
                )}
                {selectedRequest.status === 'in-progress' && (
                  <Button
                    mode="contained"
                    onPress={() => handleUpdateStatus(selectedRequest.id!, 'completed')}
                    style={styles.actionButton}
                  >
                    Complete
                  </Button>
                )}
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'in-progress') && (
                  <Button
                    mode="outlined"
                    onPress={() => handleUpdateStatus(selectedRequest.id!, 'cancelled')}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  mode="text"
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedRequest(null);
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
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
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  typeIcon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  type: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.text,
  },
  statusChip: {
    borderWidth: 1,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  requestInfo: {
    marginVertical: SPACING.sm,
  },
  roomId: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  timestamp: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray,
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
  cancelButton: {
    minWidth: 100,
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
    gap: SPACING.sm,
  },
}); 