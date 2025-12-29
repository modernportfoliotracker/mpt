import { Navbar } from "@/components/Navbar";
import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
    return (
        <>
            <Navbar />
            <div className="flex-center" style={{ minHeight: '80vh' }}>
                <RegisterForm />
            </div>
        </>
    );
}
