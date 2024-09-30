"use server";

import { redirect } from '@solidjs/router';
import * as Database from './database';
import { clearUser, getUser, setUser } from './session';

export async function login(formData: FormData): Promise<Error | undefined> {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const userID = await Database.tryLogin(username, password);
  return await setSession(userID);
}

export async function signup(formData: FormData): Promise<Error | undefined> {
  const username = String(formData.get("username"));
  const password = String(formData.get("password"));
  const userID = await Database.makeUser(username, password);
  return await setSession(userID);
}

async function setSession(userID: number): Promise<Error | undefined> {
  try {
    if (userID == null) {
      return new Error("Invalid login");
    }

    await setUser(userID);
    throw redirect("/");
  } catch (err) {
    return err as Error;
  }
}

export async function logout(): Promise<Error | undefined> {
  await clearUser();
  throw redirect("/login");
}

export async function getUsername() {
  const userID = await getUser();
  if (!userID) return null;
  return Database.getUsername(userID);
}

export async function getDaySummary(date: string) {
  const userID = await getUser();
  if (!userID) return null;
  return Database.getDaySummary(userID, new Date(date).toISOString());
}

export async function getYearSummary(year: string) {
  const userID = await getUser();
  if (!userID) return null;
  return Database.getYearSummary(userID, Number(year));
}
