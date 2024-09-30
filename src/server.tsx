/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route, MatchFilters, Navigate } from "@solidjs/router";
import { Component, lazy } from 'solid-js';

import './index.css';
import Header from './components/Header';
// import * as API from './api';

// Components
const Year = lazy(() => import('./pages/Year'));
const Day = lazy(() => import('./pages/Day'));
const Auth = lazy(() => import('./pages/Auth'));

// Filters
const dayFilters: MatchFilters = {
  day: (value: string) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === value;
  }
};

const yearFilters: MatchFilters = {
  year: (value: string) => {
    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    return !isNaN(year) && year >= 1900 && year <= currentYear;
  }
};

// Root
const Root: Component = (props: { children: any }) => {
  return (<> <Header /> {props.children} </>);
};

// // Middleware
// const AuthMiddleware: Component<{ children: any }> = (props) => {
//   const username = API.getUsername();
//   if (username === null) {
//     return <Navigate href="/login" />;
//   }
//   return props.children;
// };
//
// const GuestMiddleware: Component<{ children: any }> = (props) => {
//   const username = API.getUsername();
//   if (username !== null) {
//     return <Navigate href="/" />;
//   }
//   return props.children;
// };
//
// // Redirect
// const HomeRedirect: Component = () => {
//   const username = API.getUsername();
//   if (username === null) {
//     return <Navigate href="/login" />;
//   }
//   const currentYear = new Date().getFullYear();
//   return <Navigate href={`/year/${currentYear}`} />;
// };

// Routes
// render(() => (
//   <Router root={Root}>
//     <Route path="/day/:date" component={() => (
//         <AuthMiddleware>
//           <Day />
//         </AuthMiddleware>
//       )}
//       matchFilters={dayFilters}
//     />
//
//     <Route path="/year/:year" component={() => (
//         <AuthMiddleware>
//           <Year />
//         </AuthMiddleware>
//       )}
//       matchFilters={yearFilters}
//     />
//     <Route path="/login" component={() => (
//       <GuestMiddleware>
//         <Auth />
//       </GuestMiddleware>
//     )} />
//     <Route path="/signup" component={() => (
//       <GuestMiddleware>
//         <Auth />
//       </GuestMiddleware>
//     )} />
//     <Route path="*" component={HomeRedirect} />
//   </Router>
// ), document.getElementById('root')!);
render(() => (
  <Router root={Root}>
    <Route path="/login" component={Auth} />
  </Router>
), document.getElementById('root')!);
