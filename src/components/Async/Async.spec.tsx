import {
	render,
	screen,
	waitFor,
	waitForElementToBeRemoved,
} from "@testing-library/react";
import { Async } from ".";

describe("Async component", () => {
	it("renders correctly", async () => {
		render(<Async />);

		expect(screen.getByText("Hello World")).toBeInTheDocument();

		// o findByText espera o elemento aparecer em tela
		// Como é uma promise, precisa do await
		// Porem possui um timeout interno de 1seg
		// expect(await screen.findByText("Button")).toBeInTheDocument();

		// Tambem possui um timeout de 1seg. Pode configurar isso no objeto de opcoes
		// await waitFor(() => {
		//     return expect(screen.getByText("Button")).toBeInTheDocument();
		// })

		// Caso queiramos testar se um elemento foi removido da tela
		await waitForElementToBeRemoved(screen.queryByText("Button"));

		// get -> vai procurar um elemento de forma sincrona. Caso o elemento não seja encontrado, dará erro
		// query -> vai procurar um elemento de forma sincrona. Caso o elemento não seja encontrado, NÃO dará erro
		// find -> vai procurar um elemento de forma assincrona. Caso o elemento não seja encontrado, dará erro
	});
});
