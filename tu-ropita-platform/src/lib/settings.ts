
interface GlobalSettings {
    PSQL_CONFIG: {
        DATABASE_USER: string;
        DATABASE_HOST: string;
        DATABASE_NAME: string;
        DATABASE_PASSWORD: string;
        DATABASE_PORT: number;
    },
    OPEN_AI:{
        API_KEY: string;
    },
    AUTH:{
        JWT_SECRET: string;
        REFRESH_TOKEN_SECRET: string;
        TOKEN_EXPIRATION_TIME: string;
        REFRESH_TOKEN_EXPIRATION_TIME: string;
    },
    BASE_URL: string

}

const globalSettings: GlobalSettings = {
    PSQL_CONFIG:{
        DATABASE_USER: process.env.DATABASE_USER ?? 'postgres',
        DATABASE_HOST: process.env.DATABASE_HOST ?? 'localhost',
        DATABASE_NAME: process.env.DATABASE_NAME ?? 'plataforma_ropa',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? 'postgres',
        DATABASE_PORT: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    },
    OPEN_AI:{
        API_KEY: process.env.OPEN_AI_API_KEY ?? '',
    },
    AUTH:{
        JWT_SECRET: process.env.JWT_SECRET ?? 'secret',
        REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? 'refresh_secret',
        TOKEN_EXPIRATION_TIME: process.env.TOKEN_EXPIRATION_TIME ?? '1h',
        REFRESH_TOKEN_EXPIRATION_TIME: process.env.REFRESH_TOKEN_EXPIRATION_TIME ?? '7d',
    },
    BASE_URL: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_API_URL}`
        : 'http://localhost:3000'
};

export default globalSettings;
