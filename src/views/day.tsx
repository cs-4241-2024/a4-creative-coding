import type { Component } from 'solid-js';
import Footer from './components/footer';
import { createAsync, RouteDefinition } from '@solidjs/router';
import { getUser } from '~/lib';
import Header from './components/header';

// export const route = {
//   preload() { getUser() }
// } satisfies RouteDefinition;

const Day: Component = () => {
  // const user = createAsync(() => getUser(), { deferStream: true });
  const user = createAsync(() => getUser());

  return (
    <>
      <Header />

      <h1>Day View for {user()?.username} {user()?.id}</h1>

      <Footer />
    </>
  );
};

export default Day;
