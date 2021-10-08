import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { signIn, signOut, useSession } from "next-auth/client";
// useSession retorna informações se o usuario tem uma sessão ativa ou nao
import styles from "./styles.module.scss";

export function SignInButton() {
	const [session] = useSession();
	// As informações da sessão são armazenadas nos cookies

	return session ? (
		<button
			type="button"
			className={styles.signInButton}
			onClick={() => signOut()}
		>
			<FaGithub color="#04d361" />
			{session.user.name}
			<FiX color="#737380" className={styles.closeIcon} />
		</button>
	) : (
		<button
			type="button"
			className={styles.signInButton}
			onClick={() => signIn("github")} // Autenticação por GitHub
		>
			<FaGithub color="#eba417" />
			Sign in with GitHub
		</button>
	);
}
