/* @refresh reload */
import './index.css';
import { render } from 'solid-js/web';
import { Router, Route, MatchFilters } from "@solidjs/router";

import App from './App';
import Home from './Home';
import Day from './Day';
import NotFound from './404';

// Find Root
const root = document.getElementById('root');
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

// Filters
const dayFilters: MatchFilters = {
  day: (value: string) => {
    const date = new Date(value);
    return !isNaN(date.getTime()) && date.toISOString().split('T')[0] === value;
  }
};

// Routes
render(() => (
  <Router root={App}>
    <Route path="/day/:date" component={Day} matchFilters={dayFilters} />
    <Route path="/" component={Home} />
    <Route path="*404" component={NotFound} />
  </Router>
), root!);
