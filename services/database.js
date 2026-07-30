const path = require("path");
const Database = require("better-sqlite3");


const dbPath = path.join(
    __dirname,
    "../database/database.sqlite"
);


const db = new Database(dbPath);

db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
    guild_id TEXT PRIMARY KEY,
    channel_id TEXT,
    post_time TEXT DEFAULT '09:00',
    last_post TEXT
)
`).run();


db.prepare(`
CREATE TABLE IF NOT EXISTS custom_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT,
    type TEXT,
    question TEXT,
    author TEXT
)
`).run();



function getSettings(guildId) {

    let settings = db.prepare(
        "SELECT * FROM settings WHERE guild_id = ?"
    ).get(guildId);


    if(!settings){

        db.prepare(`
        INSERT INTO settings (guild_id)
        VALUES (?)
        `).run(guildId);


        settings = db.prepare(
            "SELECT * FROM settings WHERE guild_id = ?"
        ).get(guildId);

    }

    return settings;
}



function updateSettings(guildId, field, value){

    db.prepare(`
    UPDATE settings
    SET ${field} = ?
    WHERE guild_id = ?
    `).run(value,guildId);

}



function saveQuestion(guildId,type,question,author){

    db.prepare(`
    INSERT INTO custom_questions
    (guild_id,type,question,author)

    VALUES (?,?,?,?)
    `)
    .run(
        guildId,
        type,
        question,
        author
    );

}



module.exports = {
    db,
    getSettings,
    updateSettings,
    saveQuestion
};