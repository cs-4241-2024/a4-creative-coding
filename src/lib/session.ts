import { useSession } from "vinxi/http";

//Docs: https://docs.solidjs.com/solid-start/advanced/session#sessions

type UserSession = {
  userId?: number;
};

export function getSession() {
  return useSession<UserSession>({
    // password: process.env.SESSION_SECRET //FIXME FIXME
    password: "av98h23409 fh329 1f2n31dj2039dj2039"
  });
}

export async function getUserSession(): Promise<number | null> {
  const session = await getSession();
  return session.data.userId || null;
}

export async function setUserSession(userId: number): Promise<void> {
  const session = await getSession();
  //@ts-ignore
  await session.update((d) => (d.userId = userId));
}

export async function clearUserSession(): Promise<void> {
  const session = await getSession();
  //@ts-ignore
  await session.update((d) => (d.userId = undefined));
}
