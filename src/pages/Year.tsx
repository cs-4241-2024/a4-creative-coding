import type { Component } from 'solid-js';
import Footer from '../components/Footer';

const Year: Component = () => {
  return (
    <>
      <select class="select select-primary w-full max-w-xs">
        <option disabled>Year</option>
        <option>2024</option>
        <option>2023</option>
        <option>2022</option>
        <option>2021</option>
        <option>2020</option>
      </select>

      <Footer />
    </>
  );
};

export default Year;
