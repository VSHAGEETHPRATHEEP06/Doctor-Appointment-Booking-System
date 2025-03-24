import React from "react";
import ReactDOM from "react-dom/client";
import "antd/dist/reset.css";
import "./index.css";
import "./config/axiosConfig";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ConfigProvider } from 'antd';

// Add a global event listener for user authentication changes
if (typeof window !== 'undefined') {
  // Listen for storage events (like token changes)
  window.addEventListener('storage', (event) => {
    // If token is changed (login/logout events)
    if (event.key === 'token') {
      // Force refresh the page to ensure correct state
      window.location.reload();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#000000',
        },
      }}
    >
      <App />
    </ConfigProvider>
  </Provider>
);

reportWebVitals();
