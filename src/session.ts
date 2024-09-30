import { useSession } from "vinxi/http";

//Docs: https://docs.solidjs.com/solid-start/advanced/session#sessions

type UserSession = {
  userID?: number;
};

export function getSession() {
  return useSession<UserSession>({
    // password: process.env.SESSION_SECRET //FIXME FIXME
    password: "90324ahsdfjasjhdf"
  });
}

export async function getUser(): Promise<number | null> {
  const session = await getSession();
  return session.data.userID || null;
}

export async function setUser(userID: number): Promise<void> {
  const session = await getSession();
  //@ts-ignore
  await session.update((d) => (d.userID = userID));
}

export async function clearUser(): Promise<void> {
  const session = await getSession();
  //@ts-ignore
  await session.update((d) => (d.userID = undefined));
}
