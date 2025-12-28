import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {Colors} from '../constants/Colors';
import BottomNavigation from './BottomNavigation';

interface HomeScreenProps {
  currentScreen?: string;
  onNavigate?: (screen: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  currentScreen = 'Home',
  onNavigate = () => {},
}) => {
  // Sample stats - would come from API
  const [stats] = useState({
    totalCustomers: 1250,
    activeCustomers: 980,
    totalBusinesses: 45,
    activeBusinesses: 38,
    pendingOnboardings: 12,
    pendingRenewals: 8,
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Stats Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OVERVIEW</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalCustomers}</Text>
              <Text style={styles.statLabel}>Total Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeCustomers}</Text>
              <Text style={styles.statLabel}>Active Customers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalBusinesses}</Text>
              <Text style={styles.statLabel}>Total Businesses</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.activeBusinesses}</Text>
              <Text style={styles.statLabel}>Active Businesses</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('Customers')}>
            <Text style={styles.actionTitle}>Manage Customers</Text>
            <Text style={styles.actionSubtitle}>
              Onboarding, daily management, renewals, exiting
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('Businesses')}>
            <Text style={styles.actionTitle}>Manage Businesses</Text>
            <Text style={styles.actionSubtitle}>
              Subscription levels, features, lifecycle management
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('Content')}>
            <Text style={styles.actionTitle}>Manage Content</Text>
            <Text style={styles.actionSubtitle}>
              Edit images, carousels, homescreen elements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pending Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENDING ITEMS</Text>
          
          {stats.pendingOnboardings > 0 && (
            <TouchableOpacity
              style={styles.pendingCard}
              onPress={() => onNavigate('Customers')}>
              <Text style={styles.pendingTitle}>
                {stats.pendingOnboardings} Pending Onboardings
              </Text>
            </TouchableOpacity>
          )}

          {stats.pendingRenewals > 0 && (
            <TouchableOpacity
              style={styles.pendingCard}
              onPress={() => onNavigate('Businesses')}>
              <Text style={styles.pendingTitle}>
                {stats.pendingRenewals} Pending Renewals
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation
        currentScreen={currentScreen}
        onNavigate={onNavigate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.neutral[50],
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  actionCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.background,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.background,
    opacity: 0.9,
  },
  pendingCard: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});

export default HomeScreen;





