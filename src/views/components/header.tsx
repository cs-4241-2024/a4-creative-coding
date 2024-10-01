import { createAsync, redirect, RouteDefinition } from '@solidjs/router';
import type { Component } from 'solid-js';
import { getUser, logout } from '~/lib';

// export const route = {
//   preload() { getUser() }
// } satisfies RouteDefinition;

const Header: Component = () => {
  const user = createAsync(() => getUser(), { deferStream: true });

  const handleBackClick = () => {
    // const currentYear = new Date().getFullYear();
    // throw redirect(`/year/${currentYear}`);
  };

  return (
    <div class="navbar bg-neutral">
      <div class="navbar-start">
        {user()?.username}
      </div>
      <div class="navbar-center">
        <a onClick={handleBackClick} class="btn btn-ghost text-xl">Voice Diary</a>
      </div>
      <div class="navbar-end">
          <button class="btn" onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Header;
