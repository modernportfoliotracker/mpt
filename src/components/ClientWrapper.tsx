"use client";

import { useEffect, ReactNode, useState } from "react";
import Dashboard from "@/components/DashboardV2";
import { CurrencyProvider } from "@/context/CurrencyContext";

interface ClientWrapperProps {
    username: string;
    isOwner: boolean;
    totalValueEUR: number;
    assets: any[];
    navbar: ReactNode;
}

export function ClientWrapper({ username, isOwner, totalValueEUR, assets, navbar }: ClientWrapperProps) {
    // Force cleanup of any potential scroll locks
    useEffect(() => {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('antigravity-scroll-lock');
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return (
        <CurrencyProvider>
            {navbar}

            <Dashboard
                username={username}
                isOwner={isOwner}
                totalValueEUR={totalValueEUR}
                assets={assets}
                isBlurred={false}
            />
        </CurrencyProvider>
    );
}
