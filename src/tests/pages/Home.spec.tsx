import { render, screen } from "@testing-library/react";
import Home, { getStaticProps } from "../../pages";
import { stripe } from "../../services/stripe";

// Mockamos o useSession, como se fosse um usuário deslogado
jest.mock("next-auth/client", () => {
	return {
		useSession: () => [null, false],
	};
});

// caminho relativo ao presente arquivo
jest.mock("../../services/stripe");

describe("Home page", () => {
	it("renders correctly", () => {
		render(<Home product={{ priceId: "fake-price-id", amount: "R$ 10,00" }} />);

		expect(screen.getByText("for R$ 10,00 month")).toBeInTheDocument();
	});

	// Testamos se a função do stripe, dentro do getStaticProps, está sendo retornado de forma certa
	it("loads initial data", async () => {
		// Estamos mockando uma função interna ao stripe
		const stripePricesRetrieveMocked = jest.mocked(stripe.prices.retrieve);

		// Quando for Promise, utilizamos a mockResolvedValueOnce
		stripePricesRetrieveMocked.mockResolvedValueOnce({
			id: "fake-price-id",
			unit_amount: 1000,
		} as any); // as any serve para tirar o erro do typescript

		const response = await getStaticProps({});

		expect(response).toEqual(
			// este expect verificará se o objeto tem PELO MENOS esses atributos
			expect.objectContaining({
				// PELO MENOS, por conta do objectContaining
				props: {
					product: {
						priceId: "fake-price-id",
						amount: "$10.00",
					},
				},
			})
		);
	});
});
