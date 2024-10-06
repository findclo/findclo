import AdminBrandList from "@/components/AdminBrandList";

export default function Component() {

    return (
        <div className="container mx-auto p-4">
            <main>
                <div className="mb-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold">Administrar comercios</h1>
                </div>

                <AdminBrandList/>
            </main>
        </div>
    )
}
