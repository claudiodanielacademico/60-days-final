/**
 * Utility to retry a supabase operation with exponential backoff
 * @param operation - A function that returns a Promise (e.g., a supabase query)
 * @param maxRetries - Maximum number of retry attempts
 * @param delay - Initial delay in milliseconds
 */
export async function supabaseRetry<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<{ data: T | null; error: any }> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const { data, error } = await operation();
            if (!error) return { data, error: null };

            lastError = error;

            // Only retry on network-related errors (handled by supabase client usually, but here we add extra safety)
            // Or specific transient errors if identifiable
            console.warn(`Supabase operation failed (attempt ${i + 1}/${maxRetries + 1}):`, error.message);

            if (i < maxRetries) {
                const waitTime = delay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        } catch (e) {
            lastError = e;
            if (i < maxRetries) {
                const waitTime = delay * Math.pow(2, i);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }

    return { data: null, error: lastError };
}
