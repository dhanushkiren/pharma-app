import { useTheme } from "@react-navigation/native";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    FlatList,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { API } from '../../constants/constant';

const API_URL = API;

export default function PartnerScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const partnerTypes = ["All", "Pharmacy", "Hospital", "Clinic", "Diagnostic Center", "Other"];

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    // Filter partners based on search and type
    let filtered = partners;

    if (selectedType !== "All") {
      filtered = filtered.filter((p) => p.type === selectedType);
    }

    if (search.trim() !== '') {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.address?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredPartners(filtered);
  }, [search, selectedType, partners]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/partners/?limit=100`);
      setPartners(response.data);
      setFilteredPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPartners();
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const renderPartner = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {item.image_url && (
        <Image 
          source={{ uri: `${API_URL}${item.image_url}` }} 
          style={styles.partnerImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.partnerInfo}>
        <View style={styles.headerRow}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{item.type || 'Other'}</Text>
          </View>
        </View>
        
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        
        {item.address && (
          <View style={styles.addressContainer}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={[styles.address, { color: colors.text }]} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
        )}
        
        <View style={styles.contactContainer}>
          {item.phone && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => handleCall(item.phone)}
              activeOpacity={0.7}
            >
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {item.phone}
              </Text>
            </TouchableOpacity>
          )}
          
          {item.email && (
            <TouchableOpacity 
              style={styles.emailButton}
              onPress={() => handleEmail(item.email)}
              activeOpacity={0.7}
            >
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactText} numberOfLines={1}>
                {item.email}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🏥</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Partners Found
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.text + '99' }]}>
        {search.trim() !== '' 
          ? "Try adjusting your search or filters"
          : "No partners available at the moment"
        }
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search partners by name or location..."
            placeholderTextColor={colors.text + "60"}
            style={[styles.searchInput, { color: colors.text }]}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {partnerTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedType === type ? '#4A90E2' : colors.card,
                  borderColor: selectedType === type ? '#4A90E2' : colors.border,
                },
              ]}
              onPress={() => setSelectedType(type)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: selectedType === type ? '#fff' : colors.text },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Partner List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading partners...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredPartners}
          keyExtractor={(item) => item._id}
          renderItem={renderPartner}
          contentContainerStyle={[
            styles.listContent,
            filteredPartners.length === 0 && styles.listContentEmpty
          ]}
          onRefresh={onRefresh}
          refreshing={refreshing}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },

  clearButton: {
    padding: 4,
  },

  clearIcon: {
    fontSize: 18,
    color: '#999',
  },

  // Filter Styles
  filterSection: {
    paddingBottom: 12,
  },

  filterContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
  },

  filterText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },

  // List Styles
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  // Card Styles
  card: {
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    overflow: 'hidden',
  },

  partnerImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },

  partnerInfo: {
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  typeTag: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },

  typeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  name: { 
    fontSize: 18, 
    fontWeight: "700", 
    marginBottom: 8,
    lineHeight: 24,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  addressIcon: {
    fontSize: 14,
    marginRight: 6,
    marginTop: 2,
  },

  address: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
  },

  contactContainer: {
    gap: 8,
  },

  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    padding: 12,
    borderRadius: 10,
  },

  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 10,
  },

  contactIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  contactText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },

  // Empty State Styles
  emptyContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },

  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});