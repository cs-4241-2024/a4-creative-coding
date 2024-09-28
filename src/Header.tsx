import type { Component } from 'solid-js';
import { createSignal, onMount } from 'solid-js';
import { useNavigate, useLocation } from '@solidjs/router';

const Header: Component = () => {
  const [isBaseUrl, setIsBaseUrl] = createSignal(true);
  const navigate = useNavigate();
  const location = useLocation();

  onMount(() => {
    setIsBaseUrl(location.pathname === '/');
  });

  const handleBackClick = () => {
    navigate('/', { replace: true });
  };

  return (
    <header class="navbar bg-base-100 border-b">
      <div class="navbar-start">
        {!isBaseUrl() && (
          <button class="btn btn-ghost btn-circle" onClick={handleBackClick}>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>
      <div class="navbar-center">
        <h1 class="text-xl font-bold">Voice Diary</h1>
      </div>
      <div class="navbar-end">
        {}
      </div>
    </header>
  );
};

/* Search (will add functionality later)
<div class="navbar-end">
  <button class="btn btn-ghost btn-circle">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </button>
</div>
*/

export default Header;
