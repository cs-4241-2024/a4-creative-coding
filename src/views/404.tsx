import type { Component } from 'solid-js';
import HeaderNoAuth from './components/header_noauth';

const NotFound: Component = () => {
  return (
    <>
      <HeaderNoAuth />
      <h1>404 Not Found</h1>
    </>
  );
};

export default NotFound;
