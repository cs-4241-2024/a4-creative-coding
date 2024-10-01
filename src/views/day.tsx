import type { Component } from 'solid-js';
import Footer from './components/footer';
import { createAsync, RouteDefinition } from '@solidjs/router';
import { getUser } from '~/lib';

export const route = {
  preload() { getUser() }
} satisfies RouteDefinition;

const Day: Component = () => {
  const user = createAsync(() => getUser(), { deferStream: true });

  return (
    <>
      <h1>Day View for {user()?.username}</h1>

      <Footer />
    </>
  );
};

export default Day;
