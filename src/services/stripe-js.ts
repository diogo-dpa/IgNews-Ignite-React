import { loadStripe } from "@stripe/stripe-js";

// Stripe responsável pelo browser
export async function getStripeJs() {
	const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
	return stripeJs;
}
