const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const logger = require("../utils/logger");

function resolveDatabasePath() {
    const configuredPath = process.env.DB_PATH;

    if (configuredPath) {
        return path.resolve(configuredPath);
    }

    return path.join(__dirname, "../database/database.sqlite");
}

function createDatabaseDirectory(dbPath) {
    try {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        return true;
    }
    catch (error) {
        return false;
    }
}

let dbPath = resolveDatabasePath();
let db;

if (!createDatabaseDirectory(dbPath)) {
    dbPath = path.join(process.cwd(), "database", "database.sqlite");
    createDatabaseDirectory(dbPath);
}

db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    post_time TEXT DEFAULT '09:00',
    last_post TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT DEFAULT 'global',
    question TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'starter',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS question_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    question TEXT NOT NULL,
    used_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
`).run();

db.prepare(`
CREATE INDEX IF NOT EXISTS idx_question_usage_guild_id
ON question_usage (guild_id, used_at)
`).run();

const starterQuestions = [
    "What is one lesson you learned this week that changed your mindset?",
    "If you could master one skill overnight, what would it be?",
    "What is one thing you are proud of from this month?",
    "What would you do if you had an extra hour every day?",
    "Who inspires you most right now, and why?"
];

function ensureStarterQuestions() {
    const existingCount = db.prepare("SELECT COUNT(*) AS count FROM questions").get().count;

    if (existingCount > 0) {
        return;
    }

    const insert = db.prepare(`
        INSERT INTO questions (guild_id, question, source)
        VALUES (?, ?, ?)
    `);

    const transaction = db.transaction((questions) => {
        questions.forEach((question) => {
            insert.run("global", question, "starter");
        });
    });

    transaction(starterQuestions);
    logger.info(`Seeded ${starterQuestions.length} starter QOTD questions`);
}

ensureStarterQuestions();

function ensureGuildSettings(guildId) {
    const existing = db.prepare("SELECT guild_id FROM settings WHERE guild_id = ?").get(guildId);

    if (existing) {
        return;
    }

    db.prepare(`
        INSERT INTO settings (guild_id, post_time)
        VALUES (?, ?)
    `).run(guildId, process.env.QOTD_POST_TIME || "09:00");
}

function getSettings(guildId) {
    ensureGuildSettings(guildId);
    return db.prepare("SELECT * FROM settings WHERE guild_id = ?").get(guildId);
}

function updateSettings(guildId, field, value) {
    if (!guildId || !field) {
        return null;
    }

    const allowedFields = ["channel_id", "post_time", "last_post"];

    if (!allowedFields.includes(field)) {
        throw new Error(`Unsupported setting field: ${field}`);
    }

    ensureGuildSettings(guildId);

    db.prepare(`
        UPDATE settings
        SET ${field} = ?
        WHERE guild_id = ?
    `).run(value, guildId);

    return getSettings(guildId);
}

function getAllSettings() {
    return db.prepare("SELECT * FROM settings ORDER BY guild_id").all();
}

function saveQuestion(guildId, question, source = "custom") {
    const insert = db.prepare(`
        INSERT INTO questions (guild_id, question, source)
        VALUES (?, ?, ?)
    `);

    return insert.run(guildId, question, source).lastInsertRowid;
}

function getNextQuestion(guildId) {
    const recentQuestions = db.prepare(`
        SELECT question
        FROM question_usage
        WHERE guild_id = ?
        ORDER BY used_at DESC
        LIMIT 5
    `).all(guildId);

    const recentSet = new Set(recentQuestions.map((entry) => entry.question));

    const questions = db.prepare(`
        SELECT question
        FROM questions
        WHERE guild_id = 'global' OR guild_id = ? OR guild_id IS NULL
        ORDER BY id
    `).all(guildId);

    const availableQuestions = questions.filter((entry) => !recentSet.has(entry.question));
    const selectedQuestion = availableQuestions.length > 0
        ? availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
        : questions[Math.floor(Math.random() * questions.length)];

    return selectedQuestion?.question || null;
}

function recordQuestionUsage(guildId, question) {
    db.prepare(`
        INSERT INTO question_usage (guild_id, question)
        VALUES (?, ?)
    `).run(guildId, question);
}

module.exports = {
    db,
    getSettings,
    getAllSettings,
    updateSettings,
    saveQuestion,
    getNextQuestion,
    recordQuestionUsage
};
