import type { Component } from 'solid-js';
import Footer from './components/footer';
import { createAsync, RouteDefinition } from '@solidjs/router';
import { getUser } from '~/lib';

export const route = {
  preload() { getUser() }
} satisfies RouteDefinition;


const Year: Component = () => {
  const user = createAsync(() => getUser(), { deferStream: true });

  return (
    <>
      <select class="select select-primary w-full max-w-xs">
        <option disabled>Year</option>
        {(() => {
          const currentYear = new Date().getFullYear();
          const years = [];
          for (let year = currentYear; year >= 2020; year--) {
            years.push(<option>{year}</option>);
          }
          return years;
        })()}
      </select>

      <h1>Year View for {user()?.username}</h1>

      <Footer />
    </>
  );
};

export default Year;
