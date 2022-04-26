import { render, screen } from "@testing-library/react";
import Posts, { getStaticProps } from "../../pages/posts";
import { getPrismicClient } from "../../services/prismic";

const posts = [
	{
		slug: "my-new-post",
		title: "My New Post",
		excerpt: "Post excerpt",
		updatedAt: "April, 1",
	},
];

// mockaremos o Prismic
jest.mock("../../services/prismic");

describe("Posts page", () => {
	it("renders correctly", () => {
		render(<Posts posts={posts} />);

		expect(screen.getByText("My New Post")).toBeInTheDocument();
	});

	// Testamos se a função do stripe, dentro do getStaticProps, está sendo retornado de forma certa
	it("loads initial data", async () => {
		// Estamos mockando uma função do Prismic
		const getPrismicClientMocked = jest.mocked(getPrismicClient);

		// Mockamos o retorno do Prismic
		getPrismicClientMocked.mockReturnValueOnce({
			// Utilizando o mockResolvedValueOnce por conta da query ser uma Promise
			query: jest.fn().mockResolvedValueOnce({
				results: [
					{
						uid: "my-new-post",
						data: {
							title: [
								// no formato de rich text, semelhante ao Prismic
								{
									type: "heading",
									text: "My new post",
								},
							],
							content: [
								{
									type: "paragraph",
									text: "Post excerpt",
								},
							],
						},
						last_publication_date: "04-01-2021",
					},
				],
			}),
		} as any);

		const response = await getStaticProps({});

		expect(response).toEqual(
			// este expect verificará se o objeto tem PELO MENOS esses atributos
			expect.objectContaining({
				// PELO MENOS, por conta do objectContaining
				props: {
					posts: [
						{
							slug: "my-new-post",
							title: "My new post",
							excerpt: "Post excerpt",
							updatedAt: "01 de abril de 2021",
						},
					],
				},
			})
		);
	});
});
