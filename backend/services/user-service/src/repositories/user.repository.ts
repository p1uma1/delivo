import { query } from '../lib/db';
import { User, UserWithoutPassword, RefreshToken } from '../types/user.types';
import { ConflictError, AppError } from '@delivo/shared';

// ─── PostgreSQL Error Codes ───────────────────────────────────────────────────
const PG_UNIQUE_VIOLATION = '23505';

function handleDbError(err: any): never {
  console.error('DATABASE ERROR:', err);
  if (err.code === PG_UNIQUE_VIOLATION) {
    throw new ConflictError('A record with that value already exists');
  }
  // Re-throw as a generic internal error for unexpected DB issues
  throw new AppError('Database error', 500, false);
}

export class UserRepository {
  // ─── User CRUD ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    try {
      const res = await query('SELECT * FROM users WHERE id = $1', [id]);
      return this._mapUser(res.rows[0]);
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const res = await query('SELECT * FROM users WHERE email = $1', [email]);
      return this._mapUser(res.rows[0]);
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async create(data: {
    email: string;
    password?: string;
    name?: string;
    role: string;
  }): Promise<UserWithoutPassword> {
    try {
      const { email, password, name, role } = data;
      const res = await query(
        `INSERT INTO users (email, password, name, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, email, name, role, is_active as "isActive", created_at as "createdAt"`,
        [email, password, name, role]
      );
      return res.rows[0];
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async update(id: string, data: Partial<User>): Promise<UserWithoutPassword> {
    try {
      const fields = Object.keys(data).filter(k => k !== 'id');
      const setClause = fields.map((f, i) => `"${this._toSnakeCase(f)}" = $${i + 2}`).join(', ');
      const values = fields.map(f => (data as any)[f]);

      const res = await query(
        `UPDATE users SET ${setClause} WHERE id = $1
         RETURNING id, email, name, role, is_active as "isActive", created_at as "createdAt"`,
        [id, ...values]
      );
      return res.rows[0];
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async findAllRiders(): Promise<UserWithoutPassword[]> {
    try {
      const res = await query(
        `SELECT id, email, name, role, is_active as "isActive", created_at as "createdAt"
         FROM users WHERE role = $1 AND is_active = true`,
        ['rider']
      );
      return res.rows;
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  // ─── Refresh Token CRUD ──────────────────────────────────────────────────────

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    try {
      const res = await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)
         RETURNING id, user_id as "userId", token, expires_at as "expiresAt", created_at as "createdAt"`,
        [userId, token, expiresAt]
      );
      return res.rows[0];
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      const res = await query(
        `SELECT id, user_id as "userId", token, expires_at as "expiresAt", created_at as "createdAt"
         FROM refresh_tokens WHERE token = $1`,
        [token]
      );
      return res.rows[0] || null;
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    try {
      await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
    } catch (err: any) {
      return handleDbError(err);
    }
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────────

  private _mapUser(row: any): User | null {
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      name: row.name,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  private _toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}

export const userRepository = new UserRepository();
