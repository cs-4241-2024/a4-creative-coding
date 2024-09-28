import type { Component } from 'solid-js';
import Header from './Header';

const App: Component = (props: any) => {
  return (
    <>
      <Header />
      {props.children}
    </>
  );
};

export default App;
