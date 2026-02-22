// lib/config/permissions.ts

export const PERMISSIONS = {
  // 1. General Access
  VIEW_DASHBOARD: 1 << 0, // 1

  // 2. Posts (CRUD)
  CREATE_POST: 1 << 1, // 2
  READ_POST: 1 << 2, // 4 (Read private/draft posts usually, public is open)
  UPDATE_POST: 1 << 3, // 8
  DELETE_POST: 1 << 4, // 16

  // 3. Categories (CRUD)
  CREATE_CATEGORY: 1 << 5, // 32
  UPDATE_CATEGORY: 1 << 6, // 64
  DELETE_CATEGORY: 1 << 7, // 128

  // 4. Comments
  DELETE_COMMENT: 1 << 8, // 256
  UPDATE_COMMENT: 1 << 21, // 2097152 (New)

  // 5. Users (Managerial)
  READ_USER: 1 << 9, // 512
  UPDATE_USER: 1 << 10, // 1024 (Ban/Unban, etc)
  DELETE_USER: 1 << 11, // 2048

  // 6. Roles (Admin Level)
  CREATE_ROLE: 1 << 12, // 4096
  UPDATE_ROLE: 1 << 13, // 8192
  DELETE_ROLE: 1 << 14, // 16384

  // 7. Emails / Communication
  READ_EMAIL: 1 << 15, // 32768
  SEND_EMAIL: 1 << 16, // 65536

  // 8. System
  MANAGE_SETTINGS: 1 << 17, // 131072

  // 9. Teams
  CREATE_TEAM: 1 << 18, // 262144
  UPDATE_TEAM: 1 << 19, // 524288
  DELETE_TEAM: 1 << 20, // 1048576

  // 10. Master
  ADMINISTRATOR: 1 << 30, // Max safe bitwise for 32-bit integers
} as const;

export const ROLES = {
  // Public User (No special dashboard access)
  USER: 0,

  // Content Creator
  EDITOR:
    PERMISSIONS.VIEW_DASHBOARD |
    PERMISSIONS.CREATE_POST |
    PERMISSIONS.READ_POST |
    PERMISSIONS.UPDATE_POST,

  // Community & Content Manager
  MANAGER:
    PERMISSIONS.VIEW_DASHBOARD |
    // Post Full Access
    PERMISSIONS.CREATE_POST |
    PERMISSIONS.READ_POST |
    PERMISSIONS.UPDATE_POST |
    PERMISSIONS.DELETE_POST |
    // Category Access
    PERMISSIONS.CREATE_CATEGORY |
    PERMISSIONS.UPDATE_CATEGORY |
    PERMISSIONS.DELETE_CATEGORY |
    // Comment Moderation
    PERMISSIONS.DELETE_COMMENT |
    PERMISSIONS.UPDATE_COMMENT |
    // User Management (Limited)
    PERMISSIONS.READ_USER |
    PERMISSIONS.UPDATE_USER |
    // Team Management
    PERMISSIONS.CREATE_TEAM |
    PERMISSIONS.UPDATE_TEAM |
    PERMISSIONS.DELETE_TEAM,

  // Super Admin
  ADMIN: PERMISSIONS.ADMINISTRATOR,
};
