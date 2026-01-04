import { ReactNode } from "react";

export const Section = ({ title, subtitle, children }:{title:string, subtitle:string,children:ReactNode}) => (
    <section className="p-8 md:p-12 bg-gray-50 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-lg text-gray-500 mb-8">{subtitle}</p>
        {children}
    </section>
);