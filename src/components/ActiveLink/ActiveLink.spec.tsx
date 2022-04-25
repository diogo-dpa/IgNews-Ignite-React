import { render } from "@testing-library/react";
import { ActiveLink } from ".";

// Faço um mock da função do next para testar a unicidade da função (componente)
jest.mock("next/router", () => {
	return {
		useRouter() {
			return {
				asPath: "/",
			};
		},
	};
});

// O describe serve para categorizar os testes e separá-los de forma mais organizada
describe("ActiveLink component", () => {
	test("active link renders correctly", () => {
		const { getByText } = render(
			<ActiveLink href="/" activeClassName="active">
				<a>Home</a>
			</ActiveLink>
		);

		// Buscamos pelo texto e esperamos que esteja no documento
		expect(getByText("Home")).toBeInTheDocument();
	});

	// it tem a mesma funcionalidade do "tets"
	it("adds active class if the link as currently active", () => {
		const { getByText } = render(
			<ActiveLink href="/" activeClassName="active">
				<a>Home</a>
			</ActiveLink>
		);

		// Buscamos pelo texto e esperamos o elemento tenha a classe active
		expect(getByText("Home")).toHaveClass("active");
	});
});
