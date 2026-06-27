import NavbarTwo from "@/components/Layouts/NavbarTwo";
import Footer from "@/components/Layouts/Footer";
import Link from "next/link";
import ManualVerifyForm from "@/components/Auth/ManualVerifyForm";

export default async function VerifyPage(props) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;
    const errorDescription = searchParams?.error_description;

    return (
        <>
            <NavbarTwo />
            <div className="pt-100 pb-100">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-12">
                            <div className="login-content">
                                <div className="text-center mb-4">
                                    <h3>Verification Link Issue</h3>
                                    <p className="mt-3">
                                        {errorDescription ? errorDescription : "It seems the verification link is invalid, expired, or has already been used."}
                                    </p>
                                    {error && (
                                        <div className="alert alert-danger mt-3">
                                            {error}
                                        </div>
                                    )}
                                </div>
                                
                                <ManualVerifyForm />

                                <div className="mt-4 text-center">
                                    <Link href="/login" className="default-btn text-decoration-none">
                                        Back to Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </>
    );
}
