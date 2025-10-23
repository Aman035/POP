import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import * as sqlite3 from 'sqlite3';

export interface PostRecord {
  id?: number;
  source: string;
  post_id: string;
  created_at?: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database | null = null;

  onModuleInit(): void {
    const databasePath = this.resolveDatabasePath();
    this.ensureDirectory(databasePath);

    this.db = new sqlite3.Database(databasePath);

    // Create table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        post_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(source, post_id)
      )
    `);
  }

  onModuleDestroy(): void {
    this.db?.close();
    this.db = null;
  }

  getPost(source: string, postId: string): Promise<PostRecord | undefined> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialised'));
        return;
      }

      this.db.get(
        'SELECT * FROM posts WHERE source = ? AND post_id = ?',
        [source, postId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as PostRecord | undefined);
          }
        },
      );
    });
  }

  insertPost(source: string, postId: string): Promise<PostRecord> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialised'));
        return;
      }

      this.db.run(
        'INSERT OR IGNORE INTO posts (source, post_id) VALUES (?, ?)',
        [source, postId],
        function (err) {
          if (err) {
            reject(err);
          } else {
            // Get the inserted record
            this.db.get(
              'SELECT * FROM posts WHERE source = ? AND post_id = ?',
              [source, postId],
              (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  resolve((row as PostRecord) || { source, post_id: postId });
                }
              },
            );
          }
        }.bind(this),
      );
    });
  }

  private resolveDatabasePath(): string {
    const configuredPath = process.env.SQLITE_PATH || process.env.DATABASE_PATH;
    if (configuredPath) {
      return resolve(configuredPath);
    }

    return resolve(process.cwd(), 'var', 'data', 'pop.sqlite');
  }

  private ensureDirectory(filePath: string): void {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
