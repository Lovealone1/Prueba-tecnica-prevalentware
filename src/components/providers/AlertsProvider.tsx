/**
 * @component AlertsProvider
 * @description Global provider for notifications and alerts throughout the application.
 * Uses Sonner library to display toasts positioned in the top-right corner.
 * 
 * @example
 * <AlertsProvider />
 */
"use client";

import { Toaster } from "sonner";

export function AlertsProvider() {
    return (
        <Toaster
            position="top-right"
            richColors
            closeButton
            expand
            toastOptions={{
                duration: 3500,
            }}
            style={{
                top: "72px",    
                right: "16px",  
            }}
        />
    );
}
