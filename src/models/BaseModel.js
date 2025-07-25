import db from '../database/config';

/**
 * Base Model class with common database operations
 * All models should extend this class
 */
export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
    this.db = db;
  }

  // Find record by ID
  findById(id) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM ${this.tableName} WHERE id = ?`,
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Find all records
  findAll(orderBy = 'id ASC') {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`,
          [],
          (_, result) => {
            const items = [];
            for (let i = 0; i < result.rows.length; i++) {
              items.push(result.rows.item(i));
            }
            resolve(items);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Find records with conditions
  findWhere(conditions = {}, orderBy = 'id ASC') {
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(conditions);
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM ${this.tableName} ${whereClause ? `WHERE ${whereClause}` : ''} ORDER BY ${orderBy}`,
          values,
          (_, result) => {
            const items = [];
            for (let i = 0; i < result.rows.length; i++) {
              items.push(result.rows.item(i));
            }
            resolve(items);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Create new record
  create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`,
          values,
          (_, result) => {
            resolve({
              id: result.insertId,
              ...data
            });
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Update record by ID
  update(id, data) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          values,
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Delete record by ID
  delete(id) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM ${this.tableName} WHERE id = ?`,
          [id],
          (_, result) => {
            resolve(result.rowsAffected > 0);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Count records
  count(conditions = {}) {
    const whereClause = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(conditions);
    
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          `SELECT COUNT(*) as count FROM ${this.tableName} ${whereClause ? `WHERE ${whereClause}` : ''}`,
          values,
          (_, result) => {
            resolve(result.rows.item(0).count);
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Execute custom SQL
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => {
            const items = [];
            for (let i = 0; i < result.rows.length; i++) {
              items.push(result.rows.item(i));
            }
            resolve(items);
          },
          (_, error) => reject(error)
        );
      });
    });
  }
}

export default BaseModel;
