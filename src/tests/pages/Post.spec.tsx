import { render, screen } from "@testing-library/react";
import { getSession } from "next-auth/client";
import Post, { getServerSideProps } from "../../pages/posts/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
	slug: "my-new-post",
	title: "My New Post",
	content: "<p>Post excerpt</p>",
	updatedAt: "April, 1",
};

// mockamos o next-auth
jest.mock("next-auth/client");
// mockaremos o Prismic
jest.mock("../../services/prismic");

describe("Post page", () => {
	it("renders correctly", () => {
		render(<Post post={post} />);

		expect(screen.getByText("My New Post")).toBeInTheDocument();
		expect(screen.getByText("Post excerpt")).toBeInTheDocument();
	});

	// Fazemos um teste para a 1ª condição do if
	it("redirects user if no subscription is found", async () => {
		const getSessionMocked = jest.mocked(getSession);

		getSessionMocked.mockReturnValueOnce({
			activeSubscription: null,
		} as any);

		const response = await getServerSideProps({
			params: {
				slug: "my-new-post",
			},
		} as any);

		expect(response).toEqual(
			// este expect verificará se o objeto tem PELO MENOS esses atributos
			expect.objectContaining({
				// PELO MENOS, por conta do objectContaining
				redirect: expect.objectContaining({
					destination: "/",
				}),
			})
		);
	});

	it("loads initial data", async () => {
		const getSessionMocked = jest.mocked(getSession);
		const getPrismicClientMocked = jest.mocked(getPrismicClient);

		getSessionMocked.mockReturnValueOnce({
			activeSubscription: "fake-active-subscription",
		} as any);

		getPrismicClientMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
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
							text: "Post content",
						},
					],
				},
				last_publication_date: "04-01-2021",
			}),
		} as any);

		const response = await getServerSideProps({
			params: {
				slug: "my-new-post",
			},
		} as any);

		expect(response).toEqual(
			// este expect verificará se o objeto tem PELO MENOS esses atributos
			expect.objectContaining({
				props: {
					post: {
						slug: "my-new-post",
						title: "My new post",
						content: "<p>Post content</p>",
						updatedAt: "01 de abril de 2021",
					},
				},
			})
		);
	});
});
