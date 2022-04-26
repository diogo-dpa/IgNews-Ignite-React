import Head from "next/head";
import { GetStaticProps } from "next";
import { SubscribeButton } from "../components/SubscribeButton";
import styles from "./home.module.scss";
import { stripe } from "../services/stripe";

// Client-side: Quando não precisa de indexação.
// Server-side: Quando se rpecisa da indexação e também precisa de dados dinâmicos na página (Informações do usuário que está acessando)
// Static Site Generation: Ter uma pagia estatica compartilhada com todas as pessoas que estão utilizando a aplicação (Post de um blog em si). Precisam de SEO

interface HomeProps {
	product: {
		priceId: string;
		amount: string;
	};
}

export default function Home({ product }: HomeProps) {
	return (
		<>
			<Head>
				<title>Início | ig.news</title>
			</Head>
			<main className={styles.contentContainer}>
				<section className={styles.hero}>
					<span>👏 Hey, welcome</span>
					<h1>
						News about the <span>React</span> world.
					</h1>

					<p>
						Get access to all the publications <br />
						<span>for {product.amount} month</span>
					</p>

					<SubscribeButton />
				</section>
				<img src="/images/avatar.svg" alt="Girl coding" />
			</main>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const prices = await stripe.prices.retrieve(
		"price_1JhgOIHwmw9NaWLYl2cLuSof",
		{
			expand: ["product"],
		}
	);

	const product = {
		priceId: prices.id,
		amount: new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(prices.unit_amount / 100), // centavos
	};

	return {
		props: {
			product,
		},
		revalidate: 60 * 60 * 24, // em segundos -> 24 horas
	};
};
