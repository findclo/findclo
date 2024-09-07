
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
    }
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
    BASE_URL: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_API_URL}`
        : 'http://localhost:3000'
};

export default globalSettings;
