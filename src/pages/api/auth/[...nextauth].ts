import { query as q } from "faunadb";
import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { fauna } from "../../../services/fauna";

// Não podemos buscar algo do bacno sem o index do fauna

export default NextAuth({
	providers: [
		Providers.GitHub({
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			scope: "read:user",
		}),
	],
	// Em produção deve-se configurar isso (precisará gerar a chave com node-jose-tools)
	// jwt: {
	// 	signingKey: process.env.SIGNING_KEY,
	// },
	callbacks: {
		// Permite modificar os dados que estão no session
		async session(session) {
			try {
				// Vamos buscar se o usuário tem uma inscrição ativa ou não
				const userActiveSubscription = await fauna.query(
					q.Get(
						// Faz uma interceção entre as duas condicionais
						q.Intersection([
							q.Match(
								q.Index("subscription_by_user_ref"),
								// Seleciona o ref do usuário desejado
								q.Select(
									"ref",
									q.Get(
										q.Match(
											q.Index("user_by_email"),
											q.Casefold(session.user.email)
										)
									)
								)
							),
							q.Match(q.Index("subscription_by_status"), "active"),
						])
					)
				);
				return {
					...session,
					activeSubscription: userActiveSubscription,
				};
			} catch {
				return {
					...session,
					activeSubscription: null,
				};
			}
		},
		async signIn(user, account, profile) {
			const { email } = user;
			try {
				await fauna.query(
					q.If(
						q.Not(
							q.Exists(
								q.Match(q.Index("user_by_email"), q.Casefold(user.email))
							)
						),
						q.Create(q.Collection("users"), { data: { email } }),
						q.Get(q.Match(q.Index("user_by_email"), q.Casefold(user.email))) // ELSE DO IF
					)
				);

				return true;
			} catch (err) {
				console.log(err.message);
				return false;
			}
		},
	},
});
