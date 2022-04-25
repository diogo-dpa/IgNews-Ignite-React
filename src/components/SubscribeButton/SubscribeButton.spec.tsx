import { render, screen, fireEvent } from "@testing-library/react";
import { signIn, useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { SubscribeButton } from ".";

// Mocka o useSession de SignInButton
jest.mock("next-auth/client");

jest.mock("next/router");

// Vamos testar os comportamentos para logado e deslogado no componente
describe("SubscribeButton component", () => {
	it("renders correctly", () => {
		// Mocka o useSession para cada teste
		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<SubscribeButton />);

		expect(screen.getByText("Subscribe now")).toBeInTheDocument();
	});

	it("redirect user to sign in when not autehenticated", () => {
		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		// Mocko a função de signIn
		const signInMocked = jest.mocked(signIn);

		render(<SubscribeButton />);

		const subscribeButton = screen.getByText("Subscribe now");

		// Simula o comportamento do usuário de clicar no botão
		fireEvent.click(subscribeButton);

		// Vamos validar se a função signIn foi chamada, pois, no caso, não há redirecionamento padrão
		expect(signInMocked).toHaveBeenCalled();
	});

	it("redirects to posts when user already has a subscription", () => {
		const useRouterMocked = jest.mocked(useRouter);
		// mock do useSessionLogado
		const useSessionMocked = jest.mocked(useSession);

		useSessionMocked.mockReturnValueOnce([
			{
				user: {
					name: "John Doe",
					email: "johndoe@example.com",
				},
				activeSubscription: "fake-subscription",
				expires: "fake-expires",
			},
			false,
		]);

		const pushMock = jest.fn();

		// Estamos pegando somente a função que nos interessa no mock
		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		render(<SubscribeButton />);

		const subscribeButton = screen.getByText("Subscribe now");

		// Simula o comportamento do usuário de clicar no botão
		fireEvent.click(subscribeButton);

		expect(pushMock).toHaveBeenCalledWith("/posts");
	});
});
