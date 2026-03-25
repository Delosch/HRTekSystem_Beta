import React from "react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "../components/Footer";

export default function CtoIndex() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center p-12 text-center">
                <div className="max-w-3xl bg-white shadow-2xl rounded-3xl p-12 border border-gray-100">
                    <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">CTO Organization Chart</h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        This section is currently being developed. We are building a comprehensive organization chart to showcase our technical leadership and team structure.
                    </p>
                    <div className="inline-flex items-center space-x-2 text-teal-600 font-semibold text-lg uppercase tracking-wider">
                        <span>Coming Soon</span>
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
