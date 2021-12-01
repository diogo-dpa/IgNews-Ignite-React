import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactElement, cloneElement } from "react";

// Extende as propriedades do LinkProps, ou seja, pode usar os atributos nativos de Link
interface ActiveLinkProps extends LinkProps {
	children: ReactElement;
	activeClassName: string;
}

export function ActiveLink({
	children,
	activeClassName,
	...rest
}: ActiveLinkProps) {
	// asPath é a rota que está sendo acessada no momento
	const { asPath } = useRouter();
	const className = asPath === rest.href ? activeClassName : "";

	// O cloneElemento foi utilizado para clonar o children e adicionar propriedades, no caso, a className
	// Utilizado quando queremos modificar o comportamento de um componente que recebemos
	return (
		<Link {...rest}>
			{cloneElement(children, {
				className,
			})}
		</Link>
	);
}
