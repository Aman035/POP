"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
const sqlite3 = require("sqlite3");
let DatabaseService = class DatabaseService {
    constructor() {
        this.db = null;
    }
    onModuleInit() {
        const databasePath = this.resolveDatabasePath();
        this.ensureDirectory(databasePath);
        this.db = new sqlite3.Database(databasePath);
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
    onModuleDestroy() {
        this.db?.close();
        this.db = null;
    }
    getPost(source, postId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialised'));
                return;
            }
            this.db.get('SELECT * FROM posts WHERE source = ? AND post_id = ?', [source, postId], (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    insertPost(source, postId) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialised'));
                return;
            }
            this.db.run('INSERT OR IGNORE INTO posts (source, post_id) VALUES (?, ?)', [source, postId], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    this.db.get('SELECT * FROM posts WHERE source = ? AND post_id = ?', [source, postId], (err, row) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve(row || { source, post_id: postId });
                        }
                    });
                }
            }.bind(this));
        });
    }
    resolveDatabasePath() {
        const configuredPath = process.env.SQLITE_PATH || process.env.DATABASE_PATH;
        if (configuredPath) {
            return (0, path_1.resolve)(configuredPath);
        }
        return (0, path_1.resolve)(process.cwd(), 'var', 'data', 'pop.sqlite');
    }
    ensureDirectory(filePath) {
        const dir = (0, path_1.dirname)(filePath);
        if (!(0, fs_1.existsSync)(dir)) {
            (0, fs_1.mkdirSync)(dir, { recursive: true });
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)()
], DatabaseService);
//# sourceMappingURL=database.service.js.map