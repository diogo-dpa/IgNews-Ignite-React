import { GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { RichText } from "prismic-dom";
import { useEffect } from "react";
import { getPrismicClient } from "../../../services/prismic";

import styles from "../post.module.scss";

interface PostPreviewProps {
	post: {
		slug: string;
		title: string;
		content: string;
		updatedAt: string;
	};
}

export default function PostPreview({ post }: PostPreviewProps) {
	// verifica se o usuário está logado para mostrar o preview ou o post direto
	const [session] = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session?.activeSubscription) {
			router.push(`/posts/${post.slug}`);
		}
	}, [session]);

	return (
		<>
			<Head>
				<title>{post.title} | IgNews</title>
			</Head>

			<main className={styles.container}>
				<article className={styles.post}>
					<h1>{post.title}</h1>
					<time>{post.updatedAt}</time>
					<div
						className={`${styles.postContent} ${styles.previewContent}`}
						dangerouslySetInnerHTML={{ __html: post.content }}
					/>

					<div className={styles.continueReading}>
						Wanna continue reading?
						<Link href="/">
							<a>Subscribe now 😝</a>
						</Link>
					</div>
				</article>
			</main>
		</>
	);
}

export const getStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const { slug } = params;

	const prismic = getPrismicClient();

	// Fazendo query no Prismic
	const response = await prismic.getByUID("post", String(slug), {});

	// Formatação dos dados
	const post = {
		slug,
		title: RichText.asText(response.data.title),
		content: RichText.asHtml(response.data.content.splice(0, 3)), // pega os 3 primeiros itens do conteúdo
		updatedAt: new Date(response.last_publication_date).toLocaleDateString(
			"pt-BR",
			{
				day: "2-digit",
				month: "long",
				year: "numeric",
			}
		),
	};

	return {
		props: {
			post,
		},
	};
};
