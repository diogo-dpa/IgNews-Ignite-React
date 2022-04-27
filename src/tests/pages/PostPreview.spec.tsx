import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import Post, { getStaticProps } from "../../pages/posts/preview/[slug]";
import { getPrismicClient } from "../../services/prismic";

const post = {
	slug: "my-new-post",
	title: "My New Post",
	content: "<p>Post excerpt</p>",
	updatedAt: "April, 1",
};

// mockamos o next-auth
jest.mock("next-auth/client");

// mockamos o next/router
jest.mock("next/router");

// mockaremos o Prismic
jest.mock("../../services/prismic");

describe("Post preview page", () => {
	it("renders correctly", () => {
		const useSessionMocked = jest.mocked(useSession);

		// Mocka dados pro usuário não logado
		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<Post post={post} />);

		screen.logTestingPlaygroundURL();

		expect(screen.getByText("My New Post")).toBeInTheDocument();
		expect(screen.getByText("Post excerpt")).toBeInTheDocument();
		expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument();
	});

	// Fazemos um teste para a 1ª condição do if
	it("redirects user to full post when user is subscribed", async () => {
		const useSessionMocked = jest.mocked(useSession);
		const useRouterMocked = jest.mocked(useRouter);
		const pushMock = jest.fn();

		useSessionMocked.mockReturnValueOnce([
			{
				activeSubscription: "fake-active-subscription",
			},
			false,
		]);

		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		render(<Post post={post} />);

		expect(pushMock).toHaveBeenCalledWith("/posts/my-new-post");
	});

	it("loads initial data", async () => {
		const getPrismicClientMocked = jest.mocked(getPrismicClient);

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

		const response = await getStaticProps({
			params: {
				slug: "my-new-post",
			},
		});

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
