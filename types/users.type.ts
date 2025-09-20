export type PublicUser = {
	id: string;
	email: string;
	name: string | null;
	gender: string | null;
	district: string | null;
	whatsapp: string | null;
	university?: string | null;
	department?: string | null;
	academic_year?: string | null;
	academic_session?: string | null;
};