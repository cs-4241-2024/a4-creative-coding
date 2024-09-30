"use server";

import Database from 'better-sqlite3';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { getAudioDurationInSeconds } from 'get-audio-duration';

// -- DATABASE --

let db: Database.Database | null = null;

export function connect() {
  if (!db) {
    db = new Database('data.db');
    makeTables()
  }
}

export function disconnect() {
  if (db) {
    db.close();
    db = null;
  }
}
process.on('exit', disconnect);

export function makeTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      created DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      transcription TEXT DEFAULT '',
      length_seconds INTEGER,
      datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

// -- USER --

/** returns userID if successful, otherwise null */
export function makeUser(username: string, password: string): number | null {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);

  const stmt = db.prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)');
  const result = stmt.run(username, passwordHash, salt);

  return Number(result.lastInsertRowid);
}

/** returns userID if successful, otherwise null */
export function tryLogin(username: string, password: string): number | null {
  const stmt = db.prepare('SELECT id, password_hash, salt FROM users WHERE username = ?');
  const user = stmt.get(username) as { id: number, password_hash: string, salt: string } | undefined;

  if (user && hashPassword(password, user.salt) === user.password_hash) {
    return user.id;
  }
  return null;
}

/** userID -> username */
export function getUsername(userID: number): string | null {
  const stmt = db.prepare('SELECT username FROM users WHERE id = ?');
  const result = stmt.get(userID) as { username: string } | undefined;
  return result ? result.username : null;
}

function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

// -- RECORDINGS --

export async function saveRecording(userID: number, mp3File: Buffer, datetime?: Date): Promise<number | null> {
  try {
    // Find the length
    const tempFilePath = path.join('temp', `${userID}_${Date.now()}.mp3`);
    await fs.writeFile(tempFilePath, mp3File);
    const lengthSeconds = Math.round(await getAudioDurationInSeconds(tempFilePath));
    await fs.unlink(tempFilePath);
    console.log(`FILE WAS FOUND TO BE ${lengthSeconds} SECONDS LONG`); //FIXME

    // Create db entry
    const stmt = db.prepare('INSERT INTO recordings (user_id, length_seconds, datetime) VALUES (?, ?, ?)');
    const result = stmt.run(userID, lengthSeconds, datetime || new Date());
    const recordingID = result.lastInsertRowid as number;

    // Save file
    const userDir = path.join('recordings', userID.toString());
    await fs.mkdir(userDir, { recursive: true });
    await fs.writeFile(path.join(userDir, `${recordingID}.mp3`), mp3File);

    return recordingID;
  } catch (error) {
    console.error('Error saving recording:', error);
    return null;
  }
}

export async function deleteRecording(userID: number, id: number): Promise<boolean> {
  try {
    // Check userID == recording.userID
    const stmt = db.prepare('SELECT user_id FROM recordings WHERE id = ?');
    const result = stmt.get(id) as { user_id: number } | undefined;
    if (!result || result.user_id !== userID) {
      return false;
    }

    // Delete db entry
    const deleteStmt = db.prepare('DELETE FROM recordings WHERE id = ?');
    deleteStmt.run(id);

    // Delete the file
    await fs.unlink(path.join('recordings', userID.toString(), `${id}.mp3`));

    return true;
  } catch (error) {
    console.error('Error deleting recording:', error);
    return false;
  }
}

// export function getValidYears(userID: number): number[] {
//   const stmt = db.prepare('SELECT DISTINCT strftime("%Y", datetime) as year FROM recordings WHERE user_id = ? ORDER BY year');
//   const results = stmt.all(userID) as { year: string }[] | undefined;
//   return results.map(row => parseInt(row.year));
// }
//
// export function getYearSummary(userID: number, year: number): { [key: string]: number } {
//   const stmt = db.prepare(`
//     SELECT date(datetime) as date, COUNT(*) as count
//     FROM recordings
//     WHERE user_id = ? AND strftime('%Y', datetime) = ?
//     GROUP BY date(datetime)
//   `);
//   const results = stmt.all(userID, year.toString()) as Array<{ date: string; count: number }> | undefined;
//
//   const summary: { [key: string]: number } = {};
//   results.forEach(row => {
//     summary[row.date] = row.count;
//   });
//
//   return summary;
// }

export function getDaySummary(userID: number, date: string): { [key: number]: { length_seconds: number, transcription: string } } {
  const stmt = db.prepare(`
    SELECT id, length_seconds, transcription
    FROM recordings
    WHERE user_id = ? AND date(datetime) = ?
  `);
  const results = stmt.all(userID, date) as { id: number, length_seconds: number, transcription: string }[] | undefined;

  const summary: { [key: number]: { length_seconds: number, transcription: string } } = {};
  results.forEach(row => {
    summary[row.id] = {
      length_seconds: row.length_seconds,
      transcription: row.transcription
    };
  });

  return summary;
}
