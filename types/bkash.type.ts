export interface BkashConfig {
	base_url: string | undefined;
	username: string | undefined;
	password: string | undefined;
	app_key: string | undefined;
	app_secret: string | undefined;
}

export interface PaymentDetails {
	amount: number;
	callbackURL: string;
	orderID: string;
	reference: string;
	name: string;
	email: string;
	phone: string;
}