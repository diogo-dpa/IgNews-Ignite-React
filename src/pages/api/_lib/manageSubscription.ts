import { fauna } from "../../../services/fauna";
import { query as q } from "faunadb";
import { stripe } from "../../../services/stripe";

// Função para salvar as informações no banco de dados
export async function saveSubscription(
	subscriptionId: string,
	customerId: string
) {
	// Buscar o usuario no banco do Fauna com o ID (customerId)
	const userRef = await fauna.query(
		q.Select(
			"ref", // Select do SQL para buscar somente um campo, no caso "ref"
			q.Get(
				q.Match(
					q.Index("user_by_stripe_customer_id"), // Qual index queremos procurar
					customerId // Qual o valor que buscamos
				)
			)
		)
	);

	// Buscar mais informações da Subscription
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);

	// Salvará no banco somente os dados que forem importantes
	const subscriptionData = {
		id: subscription.id,
		userId: userRef,
		status: subscription.status,
		price_id: subscription.items.data[0].price.id, // qual produto
	};

	//Salvar os dados da subscription no FaunaDB
	await fauna.query(
		q.Create(q.Collection("subscriptions"), { data: subscriptionData })
	);
}
