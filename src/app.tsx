// @refresh reload
import { MatchFilters, Route, Router } from "@solidjs/router";
import { Component, lazy } from "solid-js";
import "./app.css";
import Header from "./views/components/header";

// Components
const Year = lazy(() => import('./views/year'));
const Day = lazy(() => import('./views/day'));
const Auth = lazy(() => import('./views/auth'));
const NotFound = lazy(() => import('./views/404'));

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

// Routes
export default function App() {
  return (
    <Router>
      <Route path="/day/:day" component={Day} matchFilters={dayFilters} />
      <Route path="/year/:year" component={Year} matchFilters={yearFilters} />
      <Route path="/login" component={Auth} />
      <Route path="/signup" component={Auth} />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
