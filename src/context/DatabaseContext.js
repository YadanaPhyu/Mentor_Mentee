import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Platform } from 'react-native';
import { db } from '../database/config';
import { getExecutedMigrations, initializeDatabase } from '../database/migrationRunner';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🚀 Initializing database on platform:', Platform.OS);
        
        // Initialize database and run migrations for all platforms
        await initializeDatabase();
        
        // Get migration status
        const executed = await getExecutedMigrations();
        setMigrationStatus(executed);
        
        console.log('✅ Database ready!');
        setIsReady(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        setError(error);
        setIsLoading(false);
        // Don't set isReady to true if database failed to initialize
        throw error; // Re-throw to prevent app from continuing with broken database
      }
    };

    setupDatabase();
  }, []);

  // Database helper functions (updated for new expo-sqlite API)
  const executeQuery = (sql, params = []) => {
    try {
      const result = db.getAllSync(sql, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  };

  const insert = async (table, data) => {
    try {
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data).map(() => '?').join(', ');
      const values = Object.values(data);
      
      const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      const result = db.runSync(sql, values);
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Database insert error:', error);
      throw error;
    }
  };

  const findById = async (table, id) => {
    try {
      const sql = `SELECT * FROM ${table} WHERE id = ? LIMIT 1`;
      const result = db.getFirstSync(sql, [id]);
      return result || null;
    } catch (error) {
      console.error('Database findById error:', error);
      throw error;
    }
  };

  const findWhere = async (table, conditions = {}, limit = null) => {
    try {
      let sql = `SELECT * FROM ${table}`;
      const values = [];
      
      if (Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        sql += ` WHERE ${whereClause}`;
        values.push(...Object.values(conditions));
      }
      
      if (limit) {
        sql += ` LIMIT ${limit}`;
      }
      
      const result = db.getAllSync(sql, values);
      return result;
    } catch (error) {
      console.error('Database findWhere error:', error);
      throw error;
    }
  };

  const findAll = async (table, limit = null) => {
    try {
      let sql = `SELECT * FROM ${table}`;
      
      if (limit) {
        sql += ` LIMIT ${limit}`;
      }

      const result = db.getAllSync(sql);
      return result;
    } catch (error) {
      console.error('Database findAll error:', error);
      throw error;
    }
  };

  const update = async (table, id, data) => {
    try {
      const setClause = Object.keys(data)
        .map(key => `${key} = ?`)
        .join(', ');
      const values = [...Object.values(data), id];
      
      const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
      const result = db.runSync(sql, values);
      return result.changes > 0;
    } catch (error) {
      console.error('Database update error:', error);
      throw error;
    }
  };

  const deleteById = async (table, id) => {
    try {
      const sql = `DELETE FROM ${table} WHERE id = ?`;
      const result = db.runSync(sql, [id]);
      return result.changes > 0;
    } catch (error) {
      console.error('Database delete error:', error);
      throw error;
    }
  };

  // Debug functions (updated for new API)
  const getAllTables = async () => {
    try {
      const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
      const result = db.getAllSync(sql);
      return result.map(row => row.name);
    } catch (error) {
      console.error('Error getting tables:', error);
      throw error;
    }
  };

  const getTableInfo = async (tableName) => {
    try {
      const sql = `PRAGMA table_info(${tableName})`;
      const result = db.getAllSync(sql);
      return result;
    } catch (error) {
      console.error('Error getting table info:', error);
      throw error;
    }
  };

  const value = {
    isReady,
    migrationStatus,
    isLoading,
    error,
    db,
    
    // CRUD operations
    executeQuery,
    insert,
    findById,
    findWhere,
    findAll,
    update,
    deleteById,
    
    // Debug helpers
    getAllTables,
    getTableInfo,
  };

  // Show loading screen while database is initializing
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ 
          marginTop: 20, 
          fontSize: 16, 
          color: '#64748b',
          fontWeight: '500'
        }}>
          Setting up database...
        </Text>
      </View>
    );
  }

  // Show error screen if database initialization failed
  if (error && !isReady) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#fef2f2',
        padding: 20
      }}>
        <Text style={{ 
          fontSize: 18, 
          color: '#dc2626',
          fontWeight: 'bold',
          marginBottom: 10
        }}>
          Database Error
        </Text>
        <Text style={{ 
          fontSize: 14, 
          color: '#7f1d1d',
          textAlign: 'center'
        }}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export default DatabaseProvider;
