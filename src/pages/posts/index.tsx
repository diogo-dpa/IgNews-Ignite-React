import { GetStaticProps } from "next";
import Head from "next/head";
import { getPrismicClient } from "../../services/prismic";
import Prismic from "@prismicio/client";
// Converte para HTML
import { RichText } from "prismic-dom";
import styles from "./styles.module.scss";

type Post = {
	slug: string;
	title: string;
	excerpt: string;
	updatedAt: string;
};

interface PostsProps {
	posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
	return (
		<>
			<Head>
				<title>Posts | IgNews</title>
			</Head>

			<main className={styles.container}>
				<div className={styles.posts}>
					{posts.map((post) => (
						<a key={post.slug} href="#">
							<time>{post.updatedAt}</time>
							<strong>{post.title}</strong>
							<p>{post.excerpt}</p>
						</a>
					))}
				</div>
			</main>
		</>
	);
}

// Função para gerar páginas estáticas e consumir menos banda do Prismic
export const getStaticProps: GetStaticProps = async () => {
	const prismic = getPrismicClient();
	// Busca no Prismic
	const response = await prismic.query(
		// Busca documentos do tipo post. Tipo array para poder usar mais de um predicates
		[Prismic.predicates.at("document.type", "post")],
		{
			// Cita o que quer buscar (a data já vem)
			fetch: ["post.title", "post.content"],
			pageSize: 100, // limite de paginas
		}
	);

	// Para debugar com console.log e verificar o que tem dentro das camadas
	//console.log(JSON.stringify(response, null, 2));

	// SEMPRE QEU PUDER, FAÇA A FORMATAÇÃO DOS DADOS LOGO APÓS CONSUMIR OS DADOS DA API EXTERNA
	// GARANTE MAIS PROCESSAMENTO
	const posts = response.results.map((post) => {
		return {
			slug: post.uid,
			title: RichText.asText(post.data.title),
			// Encontra o primeiro paragrafo
			excerpt:
				post.data.content.find((content) => content.type === "paragraph")
					?.text ?? "",
			// formata a data
			updatedAt: new Date(post.last_publication_date).toLocaleDateString(
				"pt-BR",
				{
					day: "2-digit",
					month: "long",
					year: "numeric",
				}
			),
		};
	});

	return {
		props: {
			posts,
		},
	};
};
