import type { Component } from 'solid-js';
import { useLocation } from '@solidjs/router';

const Auth: Component = () => {
  const location = useLocation();
  const isSignup = () => location.pathname === "/signup";

  return (
    <div class="flex justify-center py-12">
      <div class="mt-6 font-bold card w-96 mt-20 mb-20 shadow-xl">
        <form class="card-body">
          <h2 class="mt-10 text-center text-4xl font-bold leading-9 tracking-tight">
            {isSignup() ? "Sign Up" : "Login"}
          </h2>
          <a class="mt-3 link text-center" href={isSignup() ? "/login" : "/signup"}>
            {isSignup() ? "← Login" : "Sign Up →"}
          </a>
          <div class="items-center mt-2 space-y-3">
            <label class="form-control">
              <div class="label">
                <span class="label-text">Username</span>
              </div>
              <input class="input input-bordered w-full max-w-xs" id="username" name="username" type="text" placeholder="Username" />
            </label>
            <label class="form-control">
              <div class="label">
                <span class="label-text">Password</span>
              </div>
              <input class="input input-bordered w-full max-w-xs" id="password" name="password" type="password" placeholder="Password" />
            </label>
          </div>
          <div class="card-actions justify-end mt-4">
            <button class="btn btn-active w-full" type="submit">
              {isSignup() ? "Sign Up" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
