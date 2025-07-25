import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDatabase } from '../context/DatabaseContext';

const DatabaseTestScreen = () => {
  const { isReady, migrationStatus, getAllTables, getTableInfo, insert, findWhere } = useDatabase();
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableInfo, setTableInfo] = useState([]);
  const [sampleData, setSampleData] = useState([]);

  useEffect(() => {
    if (isReady) {
      loadTables();
    }
  }, [isReady]);

  const loadTables = async () => {
    try {
      const allTables = await getAllTables();
      setTables(allTables);
    } catch (error) {
      console.error('Error loading tables:', error);
    }
  };

  const showTableInfo = async (tableName) => {
    try {
      const info = await getTableInfo(tableName);
      const data = await findWhere(tableName, {}, 5); // Get first 5 rows
      setSelectedTable(tableName);
      setTableInfo(info);
      setSampleData(data);
    } catch (error) {
      console.error('Error loading table info:', error);
    }
  };

  const testInsert = async () => {
    try {
      const testUser = {
        email: `test${Date.now()}@example.com`,
        name: 'Test User',
        user_type: 'mentee',
        bio: 'This is a test user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const userId = await insert('users', testUser);
      Alert.alert('Success', `Test user created with ID: ${userId}`);
      
      if (selectedTable === 'users') {
        showTableInfo('users'); // Refresh data
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 10 }}>Setting up database...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Database Status</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Migration Status</Text>
        <Text style={styles.status}>
          {migrationStatus.length > 0 
            ? `${migrationStatus.length} migrations executed`
            : 'No migrations executed yet'
          }
        </Text>
        {migrationStatus.map((migration, index) => (
          <Text key={index} style={styles.migration}>• {migration}</Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Database Tables ({tables.length})</Text>
        {tables.map((table, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.tableButton,
              selectedTable === table && styles.selectedTable
            ]}
            onPress={() => showTableInfo(table)}
          >
            <Text style={styles.tableText}>{table}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedTable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Table: {selectedTable}</Text>
          
          <Text style={styles.subTitle}>Columns ({tableInfo.length}):</Text>
          {tableInfo.map((column, index) => (
            <Text key={index} style={styles.column}>
              • {column.name} ({column.type}) {column.pk ? '- PRIMARY KEY' : ''}
            </Text>
          ))}
          
          <Text style={styles.subTitle}>Sample Data ({sampleData.length} rows):</Text>
          {sampleData.length > 0 ? (
            sampleData.map((row, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.rowText}>
                  ID: {row.id} | {Object.keys(row).slice(1, 3).map(key => 
                    `${key}: ${row[key]}`
                  ).join(' | ')}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No data in this table</Text>
          )}
          
          {selectedTable === 'users' && (
            <TouchableOpacity style={styles.testButton} onPress={testInsert}>
              <Text style={styles.testButtonText}>Insert Test User</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#334155',
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
    color: '#475569',
  },
  status: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  migration: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 10,
  },
  tableButton: {
    backgroundColor: '#e2e8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedTable: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1,
  },
  tableText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  column: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 10,
    fontFamily: 'monospace',
  },
  row: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  rowText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: 'monospace',
  },
  noData: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  testButton: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default DatabaseTestScreen;
