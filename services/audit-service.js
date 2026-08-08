const pool = require('../db-mysql');

let initialized = false;

async function ensureAuditTable() {
  if (initialized) return;
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        userId INT NULL,
        action VARCHAR(100) NOT NULL,
        actionType VARCHAR(50),
        module VARCHAR(50),
        resourceType VARCHAR(50),
        resourceId VARCHAR(100),
        status VARCHAR(50),
        ipAddress VARCHAR(45),
        userAgent TEXT,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_userId (userId),
        INDEX idx_action (action),
        INDEX idx_timestamp (timestamp)
      )
    `);
    initialized = true;
  } catch (error) {
    console.error('Audit table initialization failed:', error.message);
  } finally {
    if (connection) connection.release();
  }
}

async function auditLog(req, {
  action,
  actionType = null,
  module = null,
  resourceType = null,
  resourceId = null,
  status = 'success',
  details = {}
}) {
  try {
    await ensureAuditTable();
    const userId = req?.auth?.id || details.userId || null;
    const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
    const userAgent = req?.headers?.['user-agent'] || null;
    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO audit_logs
       (userId, action, actionType, module, resourceType, resourceId, status, ipAddress, userAgent, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        actionType,
        module,
        resourceType,
        resourceId,
        status,
        ipAddress,
        userAgent,
        JSON.stringify(details)
      ]
    );
    connection.release();
  } catch (error) {
    console.error('Audit log failed:', error.message);
  }
}

module.exports = {
  ensureAuditTable,
  auditLog
};
