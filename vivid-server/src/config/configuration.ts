export default () => ({
    port: parseInt(process.env.PORT) || 3000,
	db: {
		host: process.env.POSTGRES_HOST || '127.0.0.1',
		port: parseInt(<string>process.env.POSTGRES_PORT) || 5432,
		user: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE || 'vivid'
	},
	oauth: {
		intra: {
			clientId: process.env.OAUTH_INTRA_CLIENT_ID,
			clientSecret: process.env.OAUTH_INTRA_CLIENT_SECRET,
		}
	}
});
