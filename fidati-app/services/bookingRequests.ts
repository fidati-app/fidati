import { ChatMessage, Message } from '@/types';

export const RESPONSE_WINDOW_MS = 60 * 60 * 1000;

export interface BookingRequest {
  professionalId: string;
  professionalName: string;
  imageUrl: string;
  avatarColor: string;
  packageTitle: string;
  servicePrice: number;
  bookingDate: string;
  bookingTime: string;
  note: string;
  photos: string[];
  deadline: number;
  createdAt: number;
}

const bookingRequests = new Map<string, BookingRequest>();
const chatThreads = new Map<string, ChatMessage[]>();

function formatRequestTime(date: Date) {
  return date.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function buildInitialMessages(request: BookingRequest): ChatMessage[] {
  const sentAt = formatRequestTime(new Date(request.createdAt));

  return [
    {
      id: `${request.professionalId}-booking`,
      sender: 'user',
      kind: 'booking_request',
      text: '',
      timestamp: sentAt,
    },
  ];
}

export function createBookingRequest(
  input: Omit<BookingRequest, 'deadline' | 'createdAt'>,
): BookingRequest {
  const createdAt = Date.now();
  const request: BookingRequest = {
    ...input,
    createdAt,
    deadline: createdAt + RESPONSE_WINDOW_MS,
  };

  bookingRequests.set(request.professionalId, request);
  chatThreads.set(request.professionalId, buildInitialMessages(request));
  return request;
}

export function getBookingRequest(professionalId: string): BookingRequest | undefined {
  return bookingRequests.get(professionalId);
}

export function getChatMessages(professionalId: string): ChatMessage[] {
  return chatThreads.get(professionalId) ?? [];
}

export function appendChatMessage(professionalId: string, message: ChatMessage) {
  const current = chatThreads.get(professionalId) ?? [];
  chatThreads.set(professionalId, [...current, message]);
}

export function getActiveMessageThreads(): Message[] {
  return Array.from(bookingRequests.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((request) => ({
      id: `pending-${request.professionalId}`,
      professionalId: request.professionalId,
      professionalName: request.professionalName,
      imageUrl: request.imageUrl,
      avatarColor: request.avatarColor,
      lastMessage: `Richiesta inviata · ${request.packageTitle}`,
      timestamp: formatRequestTime(new Date(request.createdAt)),
      unread: 0,
      pendingDeadline: request.deadline,
    }));
}
