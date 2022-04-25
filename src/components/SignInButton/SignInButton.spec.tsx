import { render, screen } from "@testing-library/react";
import { useSession } from "next-auth/client";
import { SignInButton } from ".";

// Mocka o useSession de SignInButton
jest.mock("next-auth/client");

// Vamos testar os comportamentos para logado e deslogado no componente
describe("SignIn component", () => {
	it("renders correctly when user is not authenticated", () => {
		const useSessionMocked = jest.mocked(useSession);

		// Quero mockar somente o proximo retorno da função
		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<SignInButton />);

		// Verifica se no SignInButton está o botão de logar, quando o usuário não está logado
		expect(screen.getByText("Sign in with GitHub")).toBeInTheDocument();
	});

	it("renders correctly when user is authenticated", () => {
		const useSessionMocked = jest.mocked(useSession);

		// Mockamos o comportamento somente para a próxima chamada ao método
		useSessionMocked.mockReturnValueOnce([
			{
				user: {
					name: "John Doe",
					email: "johndoe@example.com",
				},
				expires: "fake-expires",
			},
			false,
		]);

		render(<SignInButton />);

		// Verifica se no SignInButton está o botão de logar, quando o usuário não está logado
		expect(screen.getByText("John Doe")).toBeInTheDocument();
	});
});
