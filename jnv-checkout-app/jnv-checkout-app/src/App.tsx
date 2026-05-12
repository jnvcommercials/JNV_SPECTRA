import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';

function App() {
  return (
    <Routes>
      <Route path="/checkout/:orderId" element={<Checkout />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}

export default App;