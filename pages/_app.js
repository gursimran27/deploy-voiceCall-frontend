import "@/styles/globals.css";

import { SocketProvider } from "@/context/socket";
import { store } from "@/store";
import { Provider } from "react-redux";

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  </Provider>
  );
}
