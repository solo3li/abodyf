import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from './api';

export const createChatHubConnection = (token: string): signalR.HubConnection => {
    return new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/chat`, {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();
};

export const createPrivateChatHubConnection = (token: string): signalR.HubConnection => {
    return new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/hubs/private-chat`, {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();
};
