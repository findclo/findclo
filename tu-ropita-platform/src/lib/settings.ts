
interface GlobalSettings {
    PSQL_CONFIG: {
        DATABASE_USER: string;
        DATABASE_HOST: string;
        DATABASE_NAME: string;
        DATABASE_PASSWORD: string;
        DATABASE_PORT: number;
    },
    BASE_URL: string

}

const globalSettings: GlobalSettings = {
    PSQL_CONFIG:{
        DATABASE_USER: process.env.DATABASE_USER ?? '',
        DATABASE_HOST: process.env.DATABASE_HOST ?? '',
        DATABASE_NAME: process.env.DATABASE_NAME ?? '',
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD ?? '',
        DATABASE_PORT: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    },
    BASE_URL: process.env.NODE_ENV === 'production'
        ? `${process.env.NEXT_PUBLIC_API_URL}`
        : 'http://localhost:3000'
};

export default globalSettings;
