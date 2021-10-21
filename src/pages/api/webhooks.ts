import { NextApiRequest, NextApiResponse } from "next";

// a comunicação dos webhooks é semelhante à streaming
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

// função que converte a requisição
async function buffer(readable: Readable) {
	const chunks = [];

	for await (const chunk of readable) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	}

	return Buffer.concat(chunks);
}

// Desabilita o entendimento padrão do next das requisições que chegam
export const config = {
	api: {
		bodyParser: false,
	},
};

// Set é como se fosse um array mas nao pode duplicados
const relevantEvents = new Set([
	"checkout.session.completed",
	"customer.subscription.updated",
	"customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
	console.log("evento recebido");
	if (req.method === "POST") {
		const buf = await buffer(req);

		// busca o secret vindo do webhook, por questões de segurança
		const secret = req.headers["stripe-signature"];

		let event: Stripe.Event;
		try {
			event = stripe.webhooks.constructEvent(
				buf,
				secret,
				process.env.STRIPE_WEBHOOK_SECRET
			);
		} catch (err) {
			return res.status(400).send(`Webhook error: ${err.message}`);
		}

		const type = event.type;

		// verifica se o evento tem o tipo desejado
		if (relevantEvents.has(type)) {
			try {
				switch (type) {
					case "customer.subscription.updated":
					case "customer.subscription.deleted":
						// Personaliza o evento de Subscription
						const subscription = event.data.object as Stripe.Subscription;

						await saveSubscription(
							subscription.id,
							subscription.customer.toString(),
							false
						);

						break;
					case "checkout.session.completed":
						const checkoutSession = event.data
							.object as Stripe.Checkout.Session;

						await saveSubscription(
							checkoutSession.subscription.toString(), // ja converte para string
							checkoutSession.customer.toString(), // ja converte para string
							true
						);
						break;
					default:
						throw new Error("Unhandled event.");
				}
			} catch (err) {
				return res.json({
					error: "Webhook handler failed.",
				});
			}
		}

		res.status(200).json({
			received: true,
		});
	} else {
		// Explica pro frontend que a rota que aceita é POST
		res.setHeader("Allow", "POST");
		res.status(405).end("Method not allowed");
	}
};
