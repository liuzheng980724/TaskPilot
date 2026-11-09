export interface McpUser {
    authenticated: boolean;
    authType: 'api-key' | 'oauth';
    apiKey?: string;
}