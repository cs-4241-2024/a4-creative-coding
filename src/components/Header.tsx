import type { Component } from 'solid-js';
import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';
import { logout } from '../api';

const Header: Component = () => {
  const [, setIsBaseUrl] = createSignal(true);
  const navigate = useNavigate();
  const location = useLocation();
  const canLogout = () => !["/signup", "/login"].includes(location.pathname);

  onMount(() => {
    setIsBaseUrl(location.pathname === '/');
  });

  const handleBackClick = () => {
    if (canLogout()) {
      navigate('/', { replace: true });
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
        <Show when={canLogout()}>
          <button class="btn" onClick={logout}>Logout</button>
        </Show>
      </div>
    </div>
  );
};

export default Header;
