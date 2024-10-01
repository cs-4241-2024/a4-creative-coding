import type { Component } from 'solid-js';
import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate, useLocation, createAsync, RouteDefinition } from '@solidjs/router';
import { getUser, logout } from '~/lib';

const Header: Component = () => {
  // const user = createAsync(() => getUser(), { deferStream: true });
  const [, setIsBaseUrl] = createSignal(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = () => ["/signup", "/login"].includes(location.pathname);

  onMount(() => {
    setIsBaseUrl(location.pathname === '/');
  });

  const handleBackClick = () => {
    if (!isAuthPage()) {
      const currentYear = new Date().getFullYear();
      navigate(`/year/${currentYear}`, { replace: true });
    }
  };

  return (
    <div class="navbar bg-neutral">
      <div class="navbar-start">
      </div>
      <div class="navbar-center">
        <a onClick={handleBackClick} class="btn btn-ghost text-xl">Voice Diary</a>
      </div>
      <div class="navbar-end">
        <Show when={!isAuthPage()}>
          <button class="btn" onClick={logout}>Logout</button>
        </Show>
      </div>
    </div>
  );
};

export default Header;
