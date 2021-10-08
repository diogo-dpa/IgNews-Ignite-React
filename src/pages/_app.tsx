import { AppProps } from "next/app";
import { Header } from "../components/Header";
import { Provider as NextAuthProvider } from "next-auth/client";
import "../styles/global.scss";

function MyApp({ Component, pageProps }: AppProps) {
	//As informações do usuário logado, quando dá refresh, vem do pageProps.session
	return (
		<NextAuthProvider session={pageProps.session}>
			<Header />
			<Component {...pageProps} />
		</NextAuthProvider>
	);
}

export default MyApp;
