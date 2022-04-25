import { render } from "@testing-library/react";
import { Header } from ".";

jest.mock("next/router", () => {
	return {
		useRouter() {
			return {
				asPath: "/",
			};
		},
	};
});

// Mocka o useSession de SignInButton
jest.mock("next-auth/client", () => {
	return {
		useSession() {
			return [null, false];
		},
	};
});

describe("Header component", () => {
	it("renders correctly", () => {
		const { getByText } = render(<Header />);

		// Verifica se no Header tem Home e Posts
		expect(getByText("Home")).toBeInTheDocument();
		expect(getByText("Posts")).toBeInTheDocument();
	});
});
