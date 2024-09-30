import type { Component } from 'solid-js';
import Footer from '../components/Footer';

const Year: Component = () => {
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

      <Footer />
    </>
  );
};

export default Year;
