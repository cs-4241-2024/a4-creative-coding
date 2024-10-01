import type { Component } from 'solid-js';

const HeaderNoAuth: Component = () => {
  return (
    <div class="navbar bg-neutral">
      <div class="navbar-start">
      </div>
      <div class="navbar-center">
        <a class="btn btn-ghost text-xl">Voice Diary</a>
      </div>
      <div class="navbar-end">
      </div>
    </div>
  );
};

export default HeaderNoAuth;
